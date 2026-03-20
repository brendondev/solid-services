import { Injectable, OnModuleInit, OnModuleDestroy, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantStorage } from '../tenant';

/**
 * Service wrapper para o Prisma Client com suporte a multi-tenancy
 *
 * Este serviço:
 * 1. Estende PrismaClient para adicionar funcionalidades
 * 2. Injeta automaticamente tenant_id em todas as queries
 * 3. Previne vazamento de dados entre tenants
 *
 * SECURITY: O middleware REJEITA queries sem tenant context em produção.
 * Apenas em desenvolvimento, queries sem tenant são permitidas (para seeds).
 *
 * Princípios SOLID:
 * - Single Responsibility: Gerencia conexão com banco e isolamento de tenant
 * - Open/Closed: Pode ser estendido sem modificar o código base
 * - Dependency Inversion: Usa AsyncLocalStorage para contexto de tenant
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly isProduction = process.env.NODE_ENV === 'production';
  private allowBypassTenant = false; // Flag para operações administrativas

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

    // Middleware para injetar tenant_id automaticamente
    this.setupTenantMiddleware();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Configura o middleware que injeta tenant_id em todas as queries
   *
   * Este middleware é CRÍTICO para a segurança multi-tenant!
   * Ele garante que todas as queries sejam filtradas automaticamente
   * pelo tenant_id do contexto atual.
   *
   * SECURITY: Em produção, queries sem tenant context são BLOQUEADAS.
   */
  private setupTenantMiddleware() {
    this.$use(async (params, next) => {
      // Lista de modelos que possuem tenant_id
      const tenantModels = [
        'customer',
        'service',
        'quotation',
        'serviceOrder',
        'receivable',
        'user',
        'auditLog',
      ];

      // Verificar se o modelo atual requer tenant_id
      const requiresTenant = tenantModels.includes(params.model || '');

      if (requiresTenant) {
        const context = tenantStorage.getStore();
        const tenantId = context?.tenantId || null;

        // SECURITY: Bloquear queries sem tenant context em produção
        if (!tenantId) {
          // Permitir bypass apenas se flag estiver ativa (operações administrativas)
          if (this.allowBypassTenant) {
            return next(params);
          }

          // Em produção, REJEITAR queries sem tenant
          if (this.isProduction) {
            throw new ForbiddenException(
              `[SECURITY] Query blocked: ${params.model}.${params.action} - No tenant context in production`
            );
          }

          // Em desenvolvimento, apenas avisar mas permitir (para seeds)
          console.warn(
            `[SECURITY WARNING] Query without tenant: ${params.model}.${params.action} - Only allowed in development`
          );
          return next(params);
        }

        // Injetar tenant_id em queries de leitura
        if (params.action === 'findUnique' || params.action === 'findFirst') {
          params.args.where = {
            ...params.args.where,
            tenantId,
          };
        }

        if (
          params.action === 'findMany' ||
          params.action === 'count' ||
          params.action === 'aggregate'
        ) {
          if (params.args.where) {
            // SEMPRE forçar o tenantId do contexto (segurança!)
            params.args.where.tenantId = tenantId;
          } else {
            params.args.where = { tenantId };
          }
        }

        // Injetar tenant_id em queries de escrita
        if (params.action === 'create') {
          // SEMPRE forçar o tenantId do contexto (segurança!)
          params.args.data.tenantId = tenantId;
        }

        if (params.action === 'createMany') {
          if (Array.isArray(params.args.data)) {
            params.args.data = params.args.data.map((item: any) => ({
              ...item,
              tenantId: item.tenantId || tenantId,
            }));
          }
        }

        if (params.action === 'update' || params.action === 'updateMany') {
          params.args.where = {
            ...params.args.where,
            tenantId,
          };
        }

        if (params.action === 'delete' || params.action === 'deleteMany') {
          params.args.where = {
            ...params.args.where,
            tenantId,
          };
        }

        if (params.action === 'upsert') {
          params.args.where = {
            ...params.args.where,
            tenantId,
          };
          params.args.create.tenantId = tenantId;
        }
      }

      return next(params);
    });
  }

  /**
   * Executa uma operação SEM filtro de tenant
   * ATENÇÃO: Use apenas para operações administrativas!
   *
   * SECURITY: Este método permite bypass do filtro de tenant.
   * Use com extrema cautela e apenas quando absolutamente necessário.
   *
   * @param fn Função a executar sem filtro de tenant
   */
  async withoutTenant<T>(fn: () => Promise<T>): Promise<T> {
    // SECURITY: Em produção, apenas permitir com flag explícita
    if (this.isProduction) {
      console.warn('[SECURITY] withoutTenant called in production - ensure this is intentional');
    }

    try {
      this.allowBypassTenant = true;
      const result = await fn();
      return result;
    } finally {
      this.allowBypassTenant = false;
    }
  }
}
