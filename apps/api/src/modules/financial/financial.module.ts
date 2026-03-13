import { Module } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { DatabaseModule } from '@core/database';
import { TenantModule } from '@core/tenant';
import { AuditModule } from '../audit';

@Module({
  imports: [DatabaseModule, TenantModule, AuditModule],
  controllers: [FinancialController],
  providers: [FinancialService],
  exports: [FinancialService],
})
export class FinancialModule {}
