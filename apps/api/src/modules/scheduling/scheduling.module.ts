import { Module } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';
import { DatabaseModule } from '@core/database';
import { TenantModule } from '@core/tenant';

/**
 * Módulo de Scheduling (Agendamento)
 *
 * Gerencia agendamentos de ordens de serviço:
 * - Verificação de disponibilidade
 * - Agenda diária e semanal
 * - Sugestão de horários
 * - Estatísticas
 */
@Module({
  imports: [DatabaseModule, TenantModule],
  controllers: [SchedulingController],
  providers: [SchedulingService],
  exports: [SchedulingService],
})
export class SchedulingModule {}
