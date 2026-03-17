import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantContextService } from '@core/tenant';

/**
 * Guard que define o contexto do tenant APÓS a autenticação
 *
 * ORDEM DE EXECUÇÃO:
 * 1. JwtAuthGuard (autentica e popula req.user)
 * 2. TenantGuard (extrai tenantId de req.user e define no contexto) ← ESTE
 * 3. RolesGuard (verifica permissões)
 *
 * Este guard é CRÍTICO para segurança multi-tenant!
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantContext: TenantContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Verificar se a rota é pública (não precisa de tenant)
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Se não há usuário autenticado, deixar JwtAuthGuard lidar com isso
    if (!user || !user.tenantId) {
      return true; // JwtAuthGuard vai bloquear se necessário
    }

    // Definir contexto do tenant no AsyncLocalStorage
    // IMPORTANTE: Isso deve acontecer DENTRO do canActivate para manter
    // o contexto durante toda a execução da requisição
    this.tenantContext.setTenantId(user.tenantId);

    if (user.id) {
      this.tenantContext.setUserId(user.id);
    }

    return true;
  }
}
