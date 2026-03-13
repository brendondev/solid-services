import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

/**
 * Notifications Module
 *
 * Gerencia envio de emails via Resend
 */
@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
