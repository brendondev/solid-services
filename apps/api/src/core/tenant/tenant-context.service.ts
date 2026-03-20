import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

/**
 * Interface para o contexto do tenant
 */
export interface TenantContext {
  tenantId: string;
  userId?: string;
}

/**
 * Estende Request do Express para incluir tenant context
 */
declare global {
  namespace Express {
    interface Request {
      tenantContext?: TenantContext;
    }
  }
}

/**
 * Service responsável por gerenciar o contexto do tenant via Request
 *
 * IMPORTANTE: Este serviço é REQUEST-SCOPED para ter acesso ao request atual.
 * O contexto é armazenado diretamente no objeto request, não em AsyncLocalStorage.
 *
 * Princípio SOLID aplicado:
 * - Single Responsibility: Apenas gerencia o contexto do tenant
 * - Dependency Inversion: Interface abstrata para contexto
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  /**
   * Define o contexto do tenant no request
   */
  setContext(context: TenantContext): void {
    this.request.tenantContext = context;
  }

  /**
   * Retorna o tenant ID do contexto atual
   * @throws Error se não houver contexto de tenant
   */
  getTenantId(): string {
    const context = this.request.tenantContext;

    if (!context?.tenantId) {
      throw new Error('Tenant context not found. This should not happen.');
    }

    return context.tenantId;
  }

  /**
   * Retorna o tenant ID do contexto atual ou null se não existir
   * Útil para casos onde o tenant é opcional (ex: rotas públicas)
   */
  getTenantIdOrNull(): string | null {
    return this.request.tenantContext?.tenantId || null;
  }

  /**
   * Retorna o user ID do contexto atual
   */
  getUserId(): string | undefined {
    return this.request.tenantContext?.userId;
  }

  /**
   * Retorna todo o contexto atual
   */
  getContext(): TenantContext | undefined {
    return this.request.tenantContext;
  }

  /**
   * Verifica se existe um contexto de tenant ativo
   */
  hasContext(): boolean {
    return !!this.request.tenantContext?.tenantId;
  }
}
