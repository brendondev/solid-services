import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from '@core/tenant';

/**
 * Interceptor que garante que toda a execução da requisição
 * aconteça dentro do contexto AsyncLocal do tenant
 *
 * ORDEM DE EXECUÇÃO:
 * 1. Guards (JwtAuthGuard autentica)
 * 2. Interceptors (ESTE - cria contexto AsyncLocal) ← CRÍTICO
 * 3. Route handler
 * 4. Services
 * 5. Response
 *
 * Este interceptor ENVOLVE toda a execução em um .run()
 * garantindo que o contexto não seja perdido
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // DEBUG: Log temporário para investigação
    console.log('[TenantContextInterceptor] User:', user ? `${user.id} (tenant: ${user.tenantId})` : 'none');

    // Se há usuário autenticado, executar dentro do contexto do tenant
    if (user?.tenantId) {
      // CRÍTICO: .run() garante que TODA a execução subsequente
      // (incluindo queries do Prisma) aconteça com o contexto correto
      return new Observable((subscriber) => {
        this.tenantContext.run(
          { tenantId: user.tenantId, userId: user.id },
          () => {
            console.log('[TenantContextInterceptor] Context created for tenant:', user.tenantId);
            next.handle().subscribe({
              next: (value) => subscriber.next(value),
              error: (err) => {
                console.error('[TenantContextInterceptor] Error during execution:', err.message);
                subscriber.error(err);
              },
              complete: () => subscriber.complete(),
            });
          }
        );
      });
    }

    // Se não há usuário, executar normalmente (rotas públicas)
    console.log('[TenantContextInterceptor] No user, executing without context');
    return next.handle();
  }
}
