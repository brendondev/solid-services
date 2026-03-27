import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { DatabaseModule } from '../../core/database/database.module';
import { TenantModule } from '../../core/tenant/tenant.module';

@Module({
  imports: [DatabaseModule, TenantModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
