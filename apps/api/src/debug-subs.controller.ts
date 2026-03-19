import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './core/database/prisma.service';
import { Public } from './core/auth/decorators/public.decorator';

@Controller('debug')
export class DebugSubsController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get('subscriptions')
  async debugSubscriptions() {
    try {
      const subscriptions = await this.prisma.subscription.findMany({
        include: { plan: true },
      });

      const plans = await this.prisma.plan.findMany();
      const tenants = await this.prisma.tenant.findMany();

      return {
        success: true,
        counts: {
          subscriptions: subscriptions.length,
          plans: plans.length,
          tenants: tenants.length,
        },
        data: {
          subscriptions,
          plans: plans.map(p => ({ id: p.id, slug: p.slug, name: p.name })),
          tenants: tenants.map(t => ({ id: t.id, slug: t.slug, name: t.name })),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
    }
  }
}
