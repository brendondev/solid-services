import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

/**
 * Guard para proteger rotas com autenticação JWT
 *
 * Verifica se o usuário está autenticado via JWT
 *
 * CRÍTICO: Este guard DEVE lançar exceção se não houver token válido
 * para prevenir que requisições não autenticadas cheguem aos controllers
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Verificar se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Chamar o guard do Passport JWT
    return super.canActivate(context);
  }

  /**
   * Hook chamado quando a autenticação falha
   * CRÍTICO: Sempre lançar exceção em vez de retornar false
   */
  handleRequest(err: any, user: any, info: any) {
    // Se houver erro ou não houver usuário, bloquear com 401
    if (err || !user) {
      throw err || new UnauthorizedException('Token JWT inválido ou ausente');
    }

    return user;
  }
}
