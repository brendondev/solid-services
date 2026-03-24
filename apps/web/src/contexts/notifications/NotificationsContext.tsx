'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { notificationsAPI, NotificationItem } from '@/lib/api/notifications';
import { showToast } from '@/components/notifications/ToastContainer';

interface NotificationsContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // Carregar notificações iniciais
  const loadNotifications = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        notificationsAPI.getNotifications(),
        notificationsAPI.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Conectar ao SSE com reconexão automática
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('[Notifications] No token found, skipping SSE');
      setLoading(false);
      return;
    }

    console.log('[Notifications] Initializing SSE connection...');
    loadNotifications();

    let es: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;

      try {
        console.log('[Notifications] Creating EventSource...');
        es = notificationsAPI.createEventSource();

        es.onopen = () => {
          console.log('[Notifications] ✅ SSE connection established');
        };

        es.onmessage = (event) => {
          console.log('[Notifications] Raw SSE message received:', event);
          try {
            // NestJS SSE envia data como string JSON
            const data = JSON.parse(event.data);
            console.log('[Notifications] Parsed data:', data);

            // O NestJS pode enviar { data: notification } ou notification diretamente
            const notification: NotificationItem = data.data || data;
            console.log('[Notifications] Notification:', notification);

            // Adicionar nova notificação ao início da lista (evitar duplicatas)
            setNotifications((prev) => {
              // Verificar se já existe
              const exists = prev.some(n => n.id === notification.id);
              if (exists) {
                console.log('[Notifications] ⚠️ Duplicate notification ignored:', notification.id);
                return prev;
              }

              console.log('[Notifications] Adding to list. Current count:', prev.length);
              return [notification, ...prev];
            });

            setUnreadCount((prev) => {
              console.log('[Notifications] Incrementing unread count from:', prev);
              return prev + 1;
            });

            // Mostrar toast na interface
            showToast({
              type: 'info',
              title: notification.title,
              message: notification.message,
              duration: 6000,
            });

            // Mostrar notificação do browser
            if (typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification(notification.title, {
                  body: notification.message,
                  icon: '/logo.png',
                });
              }
            }
          } catch (error) {
            console.error('[Notifications] Failed to parse SSE message:', error, 'Raw:', event.data);
          }
        };


        es.onerror = (error: any) => {
          console.error('[Notifications] ❌ SSE connection error:', error);

          if (es) {
            es.close();
          }

          // Não reconectar se for erro de autenticação (401)
          // Isso evita loop infinito quando token expira
          if (error?.target?.readyState === EventSource.CLOSED) {
            console.log('[Notifications] Connection closed by server (possibly 401). Not reconnecting.');
            return;
          }

          // Reconectar após 5 segundos se não estiver desmontado
          if (!isUnmounted) {
            console.log('[Notifications] Scheduling reconnection in 5s...');
            reconnectTimeout = setTimeout(() => {
              console.log('[Notifications] Attempting to reconnect...');
              connect();
            }, 5000);
          }
        };

        setEventSource(es);
      } catch (error) {
        console.error('[Notifications] Failed to create SSE connection:', error);

        // Tentar reconectar
        if (!isUnmounted) {
          reconnectTimeout = setTimeout(connect, 5000);
        }
      }
    };

    // Iniciar conexão
    connect();

    // Cleanup
    return () => {
      console.log('[Notifications] Cleaning up SSE connection...');
      isUnmounted = true;

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      if (es) {
        es.close();
      }
    };
  }, [loadNotifications]);

  // Marcar como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllAsRead();

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Deletar notificação
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);

      const notification = notifications.find((n) => n.id === notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [notifications]);

  // Refresh manual
  const refresh = useCallback(async () => {
    setLoading(true);
    await loadNotifications();
  }, [loadNotifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
