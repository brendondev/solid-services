import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { DatabaseModule } from '@core/database';
import { TenantModule } from '@core/tenant';

/**
 * Módulo de Services (Catálogo de Serviços)
 *
 * Encapsula toda a funcionalidade relacionada ao catálogo de serviços
 */
@Module({
  imports: [DatabaseModule, TenantModule],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
