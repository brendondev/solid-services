import { Module } from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';
import { ServiceOrdersController } from './service-orders.controller';
import { OrderPdfService } from './services/order-pdf.service';
import { DatabaseModule } from '@core/database';
import { TenantModule } from '@core/tenant';
import { AuditModule } from '../audit';

@Module({
  imports: [DatabaseModule, TenantModule, AuditModule],
  controllers: [ServiceOrdersController],
  providers: [ServiceOrdersService, OrderPdfService],
  exports: [ServiceOrdersService, OrderPdfService],
})
export class ServiceOrdersModule {}
