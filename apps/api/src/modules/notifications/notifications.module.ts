import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsDataService } from './notifications-data.service';
import { RealTimeService } from './real-time.service';
import { NotificationsController } from './notifications.controller';

/**
 * Notifications Module
 *
 * Gerencia:
 * - Envio de emails via Resend
 * - Notificações em tempo real via SSE
 * - CRUD de notificações no banco
 */
@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsDataService,
    RealTimeService,
  ],
  exports: [
    NotificationsService,
    NotificationsDataService,
    RealTimeService,
  ],
})
export class NotificationsModule {}
