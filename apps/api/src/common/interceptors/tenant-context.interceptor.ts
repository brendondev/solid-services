import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantStorage } from '@core/tenant';

/**
 * Interceptor que define o tenant context tanto no request quanto no AsyncLocalStorage
 *
 * ORDEM DE EXECUÇÃO:
 * 1. Guards (JwtAuthGuard autentica e popula request.user)
 * 2. Interceptors (ESTE - extrai tenant do user e armazena no request + AsyncLocalStorage)
 * 3. Route handler
 * 4. Services (acessam via TenantContextService que lê do request)
 *
 * Solução Híbrida:
 * - Request object para REQUEST-SCOPED services (TenantContextService)
 * - AsyncLocalStorage para SINGLETON services (PrismaService)
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Se há usuário autenticado, definir contexto
    if (user?.tenantId) {
      const tenantContext = {
        tenantId: user.tenantId,
        userId: user.id,
      };

      // Armazenar contexto no request object (para REQUEST-SCOPED services)
      request.tenantContext = tenantContext;

      // Armazenar contexto no AsyncLocalStorage (para SINGLETON services como PrismaService)
      return new Observable((subscriber) => {
        tenantStorage.run(tenantContext, () => {
          next.handle().subscribe({
            next: (value) => subscriber.next(value),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
        });
      });
    }

    // Sem autenticação, continuar normalmente
    return next.handle();
  }
}
