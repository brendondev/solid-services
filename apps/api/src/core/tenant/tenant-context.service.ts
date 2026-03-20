import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * Interface para o contexto do tenant
 */
export interface TenantContext {
  tenantId: string;
  userId?: string;
}

/**
 * Service responsável por gerenciar o contexto do tenant usando AsyncLocalStorage
 *
 * Este serviço mantém o isolamento de dados entre requisições de diferentes tenants,
 * garantindo que cada request tenha acesso apenas aos dados do seu tenant.
 *
 * Princípio SOLID aplicado:
 * - Single Responsibility: Apenas gerencia o contexto do tenant
 * - Dependency Inversion: Interface abstrata para contexto
 */
@Injectable()
export class TenantContextService {
  private readonly asyncLocalStorage: AsyncLocalStorage<TenantContext>;

  constructor() {
    this.asyncLocalStorage = new AsyncLocalStorage<TenantContext>();
  }

  /**
   * Executa uma função dentro de um contexto de tenant
   * @param context Contexto do tenant
   * @param fn Função a ser executada
   */
  run<T>(context: TenantContext, fn: () => T): T {
    return this.asyncLocalStorage.run(context, fn);
  }

  /**
   * Retorna o tenant ID do contexto atual
   * @throws Error se não houver contexto de tenant
   */
  getTenantId(): string {
    const context = this.asyncLocalStorage.getStore();

    // DEBUG: Log temporário para investigação
    console.log('[TenantContextService] getStore():', context ? `tenant: ${context.tenantId}, user: ${context.userId}` : 'NO CONTEXT');

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
    const context = this.asyncLocalStorage.getStore();
    return context?.tenantId || null;
  }

  /**
   * Retorna o user ID do contexto atual
   */
  getUserId(): string | undefined {
    const context = this.asyncLocalStorage.getStore();
    return context?.userId;
  }

  /**
   * Retorna todo o contexto atual
   */
  getContext(): TenantContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  /**
   * Verifica se existe um contexto de tenant ativo
   */
  hasContext(): boolean {
    const context = this.asyncLocalStorage.getStore();
    return !!context?.tenantId;
  }

  /**
   * Define o tenant ID no contexto atual
   * ATENÇÃO: Use com cuidado! Normalmente o contexto é definido pelo middleware
   */
  setTenantId(tenantId: string): void {
    const currentContext = this.asyncLocalStorage.getStore();

    if (currentContext) {
      currentContext.tenantId = tenantId;
    }
  }

  /**
   * Define o user ID no contexto atual
   * ATENÇÃO: Use com cuidado! Normalmente o contexto é definido pelo middleware
   */
  setUserId(userId: string): void {
    const currentContext = this.asyncLocalStorage.getStore();

    if (currentContext) {
      currentContext.userId = userId;
    }
  }
}
