import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface NotificationEvent {
  id?: string; // ID do banco (opcional para compatibilidade)
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  createdAt: Date;
}

export interface SSEMessage {
  data: NotificationEvent;
}

/**
 * Real-Time Service
 *
 * Gerencia conexões Server-Sent Events (SSE) para notificações em tempo real
 */
@Injectable()
export class RealTimeService {
  private readonly logger = new Logger(RealTimeService.name);
  private readonly events$ = new Subject<NotificationEvent>();

  /**
   * Envia notificação para um usuário específico
   */
  sendToUser(tenantId: string, userId: string, notification: Omit<NotificationEvent, 'tenantId' | 'userId' | 'createdAt'>) {
    const event: NotificationEvent = {
      tenantId,
      userId,
      ...notification,
      createdAt: new Date(),
    };

    console.log('[RealTimeService] Sending notification:', {
      tenantId,
      userId,
      type: notification.type,
      title: notification.title,
      activeObservers: this.events$.observers.length,
    });

    this.events$.next(event);
    this.logger.debug(`Notification sent to user ${userId}: ${notification.type}`);
  }

  /**
   * Envia notificação para múltiplos usuários
   */
  sendToUsers(tenantId: string, userIds: string[], notification: Omit<NotificationEvent, 'tenantId' | 'userId' | 'createdAt'>) {
    userIds.forEach((userId) => {
      this.sendToUser(tenantId, userId, notification);
    });
  }

  /**
   * Envia notificação para todos usuários de um tenant (broadcast)
   */
  sendToTenant(tenantId: string, notification: Omit<NotificationEvent, 'tenantId' | 'userId' | 'createdAt'>) {
    // Broadcast para todo o tenant (qualquer userId)
    const event: NotificationEvent = {
      tenantId,
      userId: '*', // Wildcard para broadcast
      ...notification,
      createdAt: new Date(),
    };

    this.events$.next(event);
    this.logger.debug(`Notification broadcast to tenant ${tenantId}: ${notification.type}`);
  }

  /**
   * Cria stream SSE para um usuário específico
   */
  createStream(tenantId: string, userId: string): Observable<SSEMessage> {
    console.log('[RealTimeService] Creating SSE stream:', {
      tenantId,
      userId,
      currentObservers: this.events$.observers.length,
    });

    this.logger.debug(`SSE stream created for user ${userId} in tenant ${tenantId}`);

    return this.events$.pipe(
      filter((event) => {
        // Filtra eventos do mesmo tenant
        const matchesTenant = event.tenantId === tenantId;
        const matchesUser = event.userId === '*' || event.userId === userId;

        const shouldSend = matchesTenant && matchesUser;

        console.log('[RealTimeService] Filter event:', {
          eventTenant: event.tenantId,
          targetTenant: tenantId,
          eventUser: event.userId,
          targetUser: userId,
          matchesTenant,
          matchesUser,
          shouldSend,
        });

        return shouldSend;
      }),
      map((event) => {
        console.log('[RealTimeService] Sending event to SSE:', event);
        return {
          data: event,
        };
      }),
    );
  }

  /**
   * Retorna número de conexões ativas (para monitoramento)
   */
  getActiveConnectionsCount(): number {
    return this.events$.observers.length;
  }
}
