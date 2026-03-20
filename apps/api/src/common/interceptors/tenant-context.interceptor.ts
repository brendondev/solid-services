import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Interceptor que define o tenant context no request object
 *
 * ORDEM DE EXECUÇÃO:
 * 1. Guards (JwtAuthGuard autentica e popula request.user)
 * 2. Interceptors (ESTE - extrai tenant do user e armazena no request)
 * 3. Route handler
 * 4. Services (acessam via TenantContextService que lê do request)
 *
 * Solução: Armazenar contexto no request ao invés de AsyncLocalStorage
 * para garantir compatibilidade com RxJS Observables.
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Se há usuário autenticado, definir contexto no request
    if (user?.tenantId) {
      // Armazenar contexto diretamente no request object
      request.tenantContext = {
        tenantId: user.tenantId,
        userId: user.id,
      };
    }

    // Continuar execução normal (contexto agora está no request)
    return next.handle();
  }
}
