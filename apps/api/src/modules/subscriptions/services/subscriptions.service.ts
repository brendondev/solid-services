import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { TenantContextService } from '../../../core/tenant/tenant-context.service';
import {
  PlanDto,
  SubscriptionDto,
  CurrentUsageDto,
  SubscriptionStatusDto,
} from '../dto/plan.dto';
import {
  UpdateSubscriptionDto,
  CancelSubscriptionDto,
} from '../dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) {}

  private mapSubscriptionToDto(subscription: any): SubscriptionDto {
    return {
      ...subscription,
      status: subscription.status as 'active' | 'canceled' | 'past_due' | 'trialing',
      billingCycle: subscription.billingCycle as 'monthly' | 'yearly',
      plan: subscription.plan
        ? {
            ...subscription.plan,
            price: Number(subscription.plan.price),
            yearlyPrice: subscription.plan.yearlyPrice
              ? Number(subscription.plan.yearlyPrice)
              : undefined,
            limits: subscription.plan.limits as any,
            features: subscription.plan.features as any,
          }
        : undefined,
    };
  }

  // ============================================================================
  // PLANS
  // ============================================================================

  async getAllPlans(): Promise<PlanDto[]> {
    const plans = await this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return plans.map((plan) => ({
      ...plan,
      price: Number(plan.price),
      yearlyPrice: plan.yearlyPrice ? Number(plan.yearlyPrice) : undefined,
      limits: plan.limits as any,
      features: plan.features as any,
    }));
  }

  async getPlanBySlug(slug: string): Promise<PlanDto> {
    const plan = await this.prisma.plan.findUnique({
      where: { slug },
    });

    if (!plan) {
      throw new NotFoundException(`Plano ${slug} não encontrado`);
    }

    return {
      ...plan,
      price: Number(plan.price),
      yearlyPrice: plan.yearlyPrice ? Number(plan.yearlyPrice) : undefined,
      limits: plan.limits as any,
      features: plan.features as any,
    };
  }

  // ============================================================================
  // SUBSCRIPTION
  // ============================================================================

  async getCurrentSubscription(tenantId?: string): Promise<SubscriptionDto> {
    const tid = tenantId || this.tenantContext.getTenantIdOrNull();

    if (!tid) {
      throw new NotFoundException('Tenant ID não fornecido');
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId: tid },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException(
        'Assinatura não encontrada. Execute o seed para criar dados iniciais.',
      );
    }

    return this.mapSubscriptionToDto(subscription);
  }

  async getSubscriptionStatus(tenantId?: string): Promise<SubscriptionStatusDto> {
    const subscription = await this.getCurrentSubscription(tenantId);
    const usage = await this.getCurrentUsage(tenantId);

    const now = new Date();
    const daysUntilRenewal = Math.ceil(
      (subscription.currentPeriodEnd.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    // Verificar se pode fazer upgrade/downgrade
    const allPlans = await this.getAllPlans();
    const currentPlanIndex = allPlans.findIndex(
      (p) => p.id === subscription.planId,
    );

    return {
      subscription,
      usage,
      daysUntilRenewal,
      canUpgrade: currentPlanIndex < allPlans.length - 1,
      canDowngrade: currentPlanIndex > 0,
    };
  }

  async getCurrentUsage(tenantId?: string): Promise<CurrentUsageDto[]> {
    const tid = tenantId || this.tenantContext.getTenantIdOrNull();

    if (!tid) {
      throw new NotFoundException('Tenant ID não fornecido');
    }

    const subscription = await this.getCurrentSubscription(tid);

    if (!subscription.plan) {
      throw new NotFoundException('Plano não encontrado para a assinatura');
    }

    const limits = subscription.plan.limits;

    // Contar uso atual
    const [usersCount, customersCount, ordersCount] = await Promise.all([
      this.prisma.user.count({ where: { tenantId: tid } }),
      this.prisma.customer.count({ where: { tenantId: tid } }),
      this.prisma.serviceOrder.count({ where: { tenantId: tid } }),
    ]);

    const usage: CurrentUsageDto[] = [
      {
        metric: 'users',
        currentValue: usersCount,
        limit: limits.maxUsers,
        percentage:
          limits.maxUsers === -1 ? 0 : (usersCount / limits.maxUsers) * 100,
        isUnlimited: limits.maxUsers === -1,
      },
      {
        metric: 'customers',
        currentValue: customersCount,
        limit: limits.maxCustomers,
        percentage:
          limits.maxCustomers === -1
            ? 0
            : (customersCount / limits.maxCustomers) * 100,
        isUnlimited: limits.maxCustomers === -1,
      },
      {
        metric: 'orders',
        currentValue: ordersCount,
        limit: limits.maxOrders,
        percentage:
          limits.maxOrders === -1 ? 0 : (ordersCount / limits.maxOrders) * 100,
        isUnlimited: limits.maxOrders === -1,
      },
      {
        metric: 'storage',
        currentValue: 0, // TODO: calcular storage real
        limit: limits.maxStorage,
        percentage: 0,
        isUnlimited: limits.maxStorage === -1,
      },
    ];

    return usage;
  }

  // ============================================================================
  // FEATURE CHECKS
  // ============================================================================

  async hasFeature(featureName: string): Promise<boolean> {
    const subscription = await this.getCurrentSubscription();

    if (!subscription.plan) {
      return false;
    }

    const features = subscription.plan.features;
    return features[featureName] === true;
  }

  async checkLimit(metric: string): Promise<boolean> {
    const subscription = await this.getCurrentSubscription();

    if (!subscription.plan) {
      return true; // Sem limite se não tiver plano
    }

    const limits = subscription.plan.limits as any;
    const tenantId = this.tenantContext.getTenantId();

    const limitValue = limits[metric];

    // -1 significa ilimitado
    if (limitValue === -1) {
      return true;
    }

    // Contar valor atual baseado na métrica
    let currentValue = 0;

    switch (metric) {
      case 'maxUsers':
        currentValue = await this.prisma.user.count({ where: { tenantId } });
        break;
      case 'maxCustomers':
        currentValue = await this.prisma.customer.count({
          where: { tenantId },
        });
        break;
      case 'maxOrders':
        currentValue = await this.prisma.serviceOrder.count({
          where: { tenantId },
        });
        break;
      default:
        return true;
    }

    return currentValue < limitValue;
  }

  async recordUsage(metric: string, value: number): Promise<void> {
    const tenantId = this.tenantContext.getTenantId();
    const subscription = await this.getCurrentSubscription();

    await this.prisma.usageRecord.create({
      data: {
        subscriptionId: subscription.id,
        tenantId,
        metric,
        value,
      },
    });
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  async updateSubscription(
    dto: UpdateSubscriptionDto,
  ): Promise<SubscriptionDto> {
    const tenantId = this.tenantContext.getTenantId();
    const currentSubscription = await this.getCurrentSubscription();

    // Se está mudando de plano, validar
    if (dto.planId && dto.planId !== currentSubscription.planId) {
      const newPlan = await this.prisma.plan.findUnique({
        where: { id: dto.planId },
      });

      if (!newPlan) {
        throw new NotFoundException('Plano não encontrado');
      }

      // TODO: Validar com Stripe antes de atualizar
      // TODO: Calcular prorated amount
    }

    const updated = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        ...(dto.planId && { planId: dto.planId }),
        ...(dto.billingCycle && { billingCycle: dto.billingCycle }),
        updatedAt: new Date(),
      },
      include: { plan: true },
    });

    return this.mapSubscriptionToDto(updated);
  }

  async cancelSubscription(
    _dto: CancelSubscriptionDto,
  ): Promise<SubscriptionDto> {
    const tenantId = this.tenantContext.getTenantId();
    const currentSubscription = await this.getCurrentSubscription();

    // Não permitir cancelar se já está cancelada
    if (currentSubscription.status === 'canceled') {
      throw new BadRequestException('Assinatura já está cancelada');
    }

    // TODO: Cancelar no Stripe
    // TODO: Registrar motivo do cancelamento (audit log)
    // TODO: Usar dto.reason e dto.feedback para registrar motivo do cancelamento

    const updated = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date(),
      },
      include: { plan: true },
    });

    return this.mapSubscriptionToDto(updated);
  }

  async reactivateSubscription(): Promise<SubscriptionDto> {
    const tenantId = this.tenantContext.getTenantId();
    const currentSubscription = await this.getCurrentSubscription();

    if (currentSubscription.status !== 'canceled') {
      throw new BadRequestException(
        'Apenas assinaturas canceladas podem ser reativadas',
      );
    }

    // TODO: Reativar no Stripe

    const updated = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        status: 'active',
        canceledAt: null,
        updatedAt: new Date(),
      },
      include: { plan: true },
    });

    return this.mapSubscriptionToDto(updated);
  }
}
