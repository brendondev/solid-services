import { Module } from '@nestjs/common';
import { CustomerPortalService } from './customer-portal.service';
import { CustomerPortalController } from './customer-portal.controller';
import { PortalManagementController } from './portal-management.controller';
import { DatabaseModule } from '@core/database';
import { TenantModule } from '@core/tenant';
import { NotificationsModule } from '../notifications';
import { QuotationsModule } from '../quotations';
import { ServiceOrdersModule } from '../service-orders';

/**
 * Customer Portal Module
 *
 * Portal público para clientes acessarem:
 * - Orçamentos pendentes
 * - Ordens em andamento
 * - Histórico de serviços
 * - Geração de PDFs
 *
 * + Gerenciamento de tokens (admin)
 */
@Module({
  imports: [DatabaseModule, TenantModule, NotificationsModule, QuotationsModule, ServiceOrdersModule],
  controllers: [CustomerPortalController, PortalManagementController],
  providers: [CustomerPortalService],
  exports: [CustomerPortalService],
})
export class CustomerPortalModule {}
