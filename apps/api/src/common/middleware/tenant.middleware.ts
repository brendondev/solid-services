import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContextService } from '@core/tenant';

/**
 * Middleware que extrai o tenant ID da requisição e define no contexto
 *
 * Estratégias de extração (em ordem de prioridade):
 * 1. Header X-Tenant-ID (para testes e integração)
 * 2. JWT payload (tenantId extraído do token)
 * 3. Subdomain (ex: demo.solid-service.com -> tenant: demo)
 *
 * Este middleware é CRÍTICO para a segurança multi-tenant!
 *
 * Princípios SOLID:
 * - Single Responsibility: Apenas extrai e define o contexto do tenant
 * - Open/Closed: Novas estratégias podem ser adicionadas sem modificar código existente
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantContext: TenantContextService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const tenantId = this.extractTenantId(req);
    const userId = (req as any).user?.id;

    if (!tenantId) {
      // Para rotas públicas, permitir sem tenant
      // Para rotas protegidas, o AuthGuard vai bloquear
      return next();
    }

    // Executar a requisição dentro do contexto do tenant
    this.tenantContext.run({ tenantId, userId }, () => {
      next();
    });
  }

  /**
   * Extrai o tenant ID da requisição
   *
   * @param req Request HTTP
   * @returns Tenant ID ou null
   */
  private extractTenantId(req: Request): string | null {
    // 1. Tentar via header (útil para testes e APIs)
    const headerTenantId = req.headers['x-tenant-id'] as string;
    if (headerTenantId) {
      return headerTenantId;
    }

    // 2. Tentar via JWT (será implementado quando tivermos auth)
    const user = (req as any).user;
    if (user?.tenantId) {
      return user.tenantId;
    }

    // 3. Tentar via subdomain
    const host = req.headers.host || '';
    const subdomain = this.extractSubdomain(host);
    if (subdomain) {
      return subdomain;
    }

    return null;
  }

  /**
   * Extrai o subdomain do host
   *
   * @param host Host da requisição
   * @returns Subdomain ou null
   */
  private extractSubdomain(host: string): string | null {
    // Remove porta se existir
    const hostWithoutPort = host.split(':')[0];

    // Split por pontos
    const parts = hostWithoutPort.split('.');

    // Se tiver mais de 2 partes e não for localhost, primeiro é subdomain
    // Ex: demo.solid-service.com -> ['demo', 'solid-service', 'com']
    if (parts.length > 2 && parts[0] !== 'localhost' && parts[0] !== '127') {
      return parts[0];
    }

    return null;
  }
}
