'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { notificationsAPI, NotificationItem } from '@/lib/api/notifications';

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

  // Conectar ao SSE
  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setLoading(false);
      return;
    }

    loadNotifications();

    // Criar conexão SSE
    try {
      const es = notificationsAPI.createEventSource();

      es.onmessage = (event) => {
        try {
          const notification: NotificationItem = JSON.parse(event.data);

          // Adicionar nova notificação ao início da lista
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Mostrar toast (será implementado)
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/logo.png',
              });
            }
          }
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      es.onerror = (error) => {
        console.error('SSE connection error:', error);
        es.close();
      };

      setEventSource(es);

      return () => {
        es.close();
      };
    } catch (error) {
      console.error('Failed to create SSE connection:', error);
    }
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
