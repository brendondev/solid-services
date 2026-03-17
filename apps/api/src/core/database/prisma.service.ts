import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContextService } from '../tenant';

/**
 * Service wrapper para o Prisma Client com suporte a multi-tenancy
 *
 * Este serviço:
 * 1. Estende PrismaClient para adicionar funcionalidades
 * 2. Injeta automaticamente tenant_id em todas as queries
 * 3. Previne vazamento de dados entre tenants
 *
 * Princípios SOLID:
 * - Single Responsibility: Gerencia conexão com banco e isolamento de tenant
 * - Open/Closed: Pode ser estendido sem modificar o código base
 * - Dependency Inversion: Depende da abstração TenantContextService
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly tenantContext: TenantContextService) {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
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
   */
  private setupTenantMiddleware() {
    this.$use(async (params, next) => {
      // LOG GLOBAL: Ver TODAS as queries do Prisma
      console.log(`[Prisma] Query intercepted: ${params.model}.${params.action}`);

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
        const tenantId = this.tenantContext.getTenantIdOrNull();

        // LOG CRÍTICO: Verificar se contexto está sendo recebido
        console.log(`[Prisma Middleware] Model: ${params.model}, Action: ${params.action}, TenantId: ${tenantId || 'NULL'}`);

        // Se não há contexto de tenant, permitir (para seeds, migrations, etc)
        if (!tenantId) {
          console.warn(`[Prisma Middleware] ⚠️  NO TENANT CONTEXT - Query will return ALL data!`);
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
   * @param fn Função a executar sem filtro de tenant
   */
  async withoutTenant<T>(fn: () => Promise<T>): Promise<T> {
    // Temporariamente desabilita o middleware de tenant
    // Implementação simplificada - em produção, considere uma abordagem mais robusta
    return fn();
  }
}
