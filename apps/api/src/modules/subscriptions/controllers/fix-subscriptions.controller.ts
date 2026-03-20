import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '@core/database';
import { Public } from '@core/auth/decorators';

/**
 * Controller temporário para corrigir tenants sem assinatura
 *
 * IMPORTANTE: Remover após execução em produção
 */
@ApiTags('Admin - Fix')
@Controller('admin/fix-subscriptions')
export class FixSubscriptionsController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria assinatura FREE para todos os tenants que não possuem
   */
  @Public()
  @Post()
  @ApiOperation({
    summary: 'Corrigir tenants sem assinatura (criar FREE padrão)',
    description: 'Endpoint temporário para corrigir dados. Execute apenas uma vez.',
  })
  @ApiResponse({ status: 201, description: 'Assinaturas criadas com sucesso' })
  async fixMissingSubscriptions() {
    // Buscar todos os tenants
    const tenants = await this.prisma.tenant.findMany({
      include: {
        subscription: true,
      },
    });

    // Filtrar tenants sem assinatura
    const tenantsWithoutSubscription = tenants.filter((t) => !t.subscription);

    if (tenantsWithoutSubscription.length === 0) {
      return {
        message: 'Todos os tenants já possuem assinatura',
        fixed: 0,
        total: tenants.length,
      };
    }

    // Buscar plano FREE
    const freePlan = await this.prisma.plan.findUnique({
      where: { slug: 'free' },
    });

    if (!freePlan) {
      throw new Error(
        'Plano FREE não encontrado. Execute o seed: npx prisma db seed',
      );
    }

    // Criar assinaturas para tenants sem assinatura
    const now = new Date();
    const currentPeriodEnd = new Date(now);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    const created = await Promise.all(
      tenantsWithoutSubscription.map((tenant) =>
        this.prisma.subscription.create({
          data: {
            tenantId: tenant.id,
            planId: freePlan.id,
            status: 'active',
            billingCycle: 'monthly',
            currentPeriodStart: now,
            currentPeriodEnd,
          },
        }),
      ),
    );

    return {
      message: 'Assinaturas criadas com sucesso',
      fixed: created.length,
      total: tenants.length,
      tenants: tenantsWithoutSubscription.map((t) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
      })),
    };
  }
}
