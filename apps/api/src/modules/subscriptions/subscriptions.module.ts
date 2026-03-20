import { Module } from '@nestjs/common';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { FixSubscriptionsController } from './controllers/fix-subscriptions.controller';
import { SubscriptionsService } from './services/subscriptions.service';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantContextService } from '../../core/tenant/tenant-context.service';

@Module({
  controllers: [SubscriptionsController, FixSubscriptionsController],
  providers: [SubscriptionsService, PrismaService, TenantContextService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
