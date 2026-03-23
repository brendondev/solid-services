import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface NotificationEvent {
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
    this.logger.debug(`SSE stream created for user ${userId} in tenant ${tenantId}`);

    return this.events$.pipe(
      filter((event) => {
        // Filtra eventos do mesmo tenant
        if (event.tenantId !== tenantId) {
          return false;
        }

        // Aceita se for broadcast ou destinado ao usuário específico
        return event.userId === '*' || event.userId === userId;
      }),
      map((event) => ({
        data: event,
      })),
    );
  }

  /**
   * Retorna número de conexões ativas (para monitoramento)
   */
  getActiveConnectionsCount(): number {
    return this.events$.observers.length;
  }
}
