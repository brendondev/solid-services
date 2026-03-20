import { Module } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { QuotationsController } from './quotations.controller';
import { QuotationPdfService } from './services/quotation-pdf.service';
import { DatabaseModule } from '@core/database';
import { TenantModule } from '@core/tenant';
import { NotificationsModule } from '../notifications';
import { AuditModule } from '../audit';

/**
 * Módulo de Quotations (Orçamentos)
 *
 * Encapsula toda a funcionalidade relacionada a orçamentos
 */
@Module({
  imports: [DatabaseModule, TenantModule, NotificationsModule, AuditModule],
  controllers: [QuotationsController],
  providers: [QuotationsService, QuotationPdfService],
  exports: [QuotationsService, QuotationPdfService],
})
export class QuotationsModule {}
