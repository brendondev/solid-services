import { Module } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { QuotationsController } from './quotations.controller';
import { DatabaseModule } from '@core/database';
import { TenantModule } from '@core/tenant';

/**
 * Módulo de Quotations (Orçamentos)
 *
 * Encapsula toda a funcionalidade relacionada a orçamentos
 */
@Module({
  imports: [DatabaseModule, TenantModule],
  controllers: [QuotationsController],
  providers: [QuotationsService],
  exports: [QuotationsService],
})
export class QuotationsModule {}
