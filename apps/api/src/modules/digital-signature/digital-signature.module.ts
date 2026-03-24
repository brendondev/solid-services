import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../core/database';
import { StorageModule } from '../../core/storage';
import { NotificationsModule } from '../notifications/notifications.module';
import { DigitalSignatureController } from './digital-signature.controller';
import { DigitalSignatureService } from './digital-signature.service';
import { GovBrSignatureService } from './govbr-signature.service';
import { LocalSignatureService } from './local-signature.service';

@Module({
  imports: [ConfigModule, DatabaseModule, StorageModule, NotificationsModule],
  controllers: [DigitalSignatureController],
  providers: [
    DigitalSignatureService,
    GovBrSignatureService,
    LocalSignatureService,
  ],
  exports: [DigitalSignatureService],
})
export class DigitalSignatureModule {}
