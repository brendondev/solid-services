import { Module } from '@nestjs/common';
import { CustomerPortalService } from './customer-portal.service';
import { CustomerPortalController } from './customer-portal.controller';
import { DatabaseModule } from '@core/database';
import { TenantModule } from '@core/tenant';
import { NotificationsModule } from '../notifications';

/**
 * Customer Portal Module
 *
 * Portal público para clientes acessarem:
 * - Orçamentos pendentes
 * - Ordens em andamento
 * - Histórico de serviços
 */
@Module({
  imports: [DatabaseModule, TenantModule, NotificationsModule],
  controllers: [CustomerPortalController],
  providers: [CustomerPortalService],
  exports: [CustomerPortalService],
})
export class CustomerPortalModule {}
