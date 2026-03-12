import { Global, Module } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';

/**
 * Módulo global para gerenciamento de contexto de tenant
 *
 * Este módulo é marcado como @Global() para que o TenantContextService
 * esteja disponível em toda a aplicação sem precisar importar o módulo
 */
@Global()
@Module({
  providers: [TenantContextService],
  exports: [TenantContextService],
})
export class TenantModule {}
