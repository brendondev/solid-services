import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard para verificar roles do usuário
 *
 * Verifica se o usuário possui as roles necessárias para acessar a rota
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Verificar se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Buscar usuário da request (colocado pelo JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // CRÍTICO: Se não há usuário autenticado e a rota não é pública, bloquear
    // Mesmo que não haja roles requeridas, a autenticação é obrigatória
    if (!user) {
      throw new UnauthorizedException('Autenticação necessária para acessar este recurso');
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se não há roles requeridas mas tem usuário autenticado, permite
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Acesso negado. Roles necessárias: ${requiredRoles.join(', ')}. Suas roles: ${user.roles?.join(', ') || 'nenhuma'}`
      );
    }

    return true;
  }
}
