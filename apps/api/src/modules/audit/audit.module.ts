import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { DatabaseModule } from '@core/database';
import { TenantModule } from '@core/tenant';

/**
 * Audit Module
 *
 * Módulo de auditoria para rastreamento de ações críticas
 */
@Module({
  imports: [DatabaseModule, TenantModule],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
