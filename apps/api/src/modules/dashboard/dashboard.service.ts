import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Dashboard operacional completo
   */
  async getOperationalDashboard() {
    const tenantId = this.tenantContext.getTenantId();
    const now = new Date();

    // Período do mês atual
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Métricas paralelas
    const [
      customersCount,
      servicesCount,
      quotationsStats,
      ordersStats,
      ordersThisMonth,
      financialStats,
      recentOrders,
      upcomingOrders,
    ] = await Promise.all([
      // Total de clientes ativos
      this.prisma.customer.count({
        where: {
          tenantId,
          status: 'active',
        },
      }),

      // Total de serviços ativos
      this.prisma.service.count({
        where: {
          tenantId,
          status: 'active',
        },
      }),

      // Estatísticas de orçamentos
      this.prisma.quotation.groupBy({
        by: ['status'],
        where: {
          tenantId,
        },
        _count: {
          status: true,
        },
      }),

      // Estatísticas de ordens
      this.prisma.serviceOrder.groupBy({
        by: ['status'],
        where: {
          tenantId,
        },
        _count: {
          status: true,
        },
      }),

      // Ordens criadas no mês
      this.prisma.serviceOrder.count({
        where: {
          tenantId,
          createdAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      }),

      // Métricas financeiras
      this.prisma.receivable.aggregate({
        where: {
          tenantId,
          status: {
            in: ['pending', 'partial'],
          },
        },
        _sum: {
          amount: true,
          paidAmount: true,
        },
        _count: {
          id: true,
        },
      }),

      // Ordens recentes
      this.prisma.serviceOrder.findMany({
        where: {
          tenantId,
        },
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          number: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      // Ordens agendadas próximas
      this.prisma.serviceOrder.findMany({
        where: {
          tenantId,
          status: {
            in: ['scheduled', 'in_progress'],
          },
          scheduledFor: {
            gte: now,
          },
        },
        take: 5,
        orderBy: {
          scheduledFor: 'asc',
        },
        select: {
          id: true,
          number: true,
          status: true,
          scheduledFor: true,
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    // Processar estatísticas de orçamentos
    const quotationsMap = quotationsStats.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Processar estatísticas de ordens
    const ordersMap = ordersStats.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Calcular pendências financeiras
    const pendingAmount = Number(financialStats._sum.amount || 0) - Number(financialStats._sum.paidAmount || 0);

    return {
      summary: {
        activeCustomers: customersCount,
        activeServices: servicesCount,
        ordersThisMonth,
        pendingReceivables: financialStats._count.id,
        pendingAmount,
      },
      quotations: {
        draft: quotationsMap['draft'] || 0,
        sent: quotationsMap['sent'] || 0,
        approved: quotationsMap['approved'] || 0,
        rejected: quotationsMap['rejected'] || 0,
        total: quotationsStats.reduce((sum, item) => sum + item._count.status, 0),
      },
      orders: {
        open: ordersMap['open'] || 0,
        scheduled: ordersMap['scheduled'] || 0,
        in_progress: ordersMap['in_progress'] || 0,
        completed: ordersMap['completed'] || 0,
        cancelled: ordersMap['cancelled'] || 0,
        total: ordersStats.reduce((sum, item) => sum + item._count.status, 0),
      },
      recentOrders: recentOrders.map((order) => ({
        ...order,
        totalAmount: Number(order.totalAmount),
      })),
      upcomingOrders,
    };
  }

  /**
   * Métricas rápidas para header/sidebar
   */
  async getQuickStats() {
    const tenantId = this.tenantContext.getTenantId();

    const [pendingQuotations, activeOrders, overdueReceivables] = await Promise.all([
      this.prisma.quotation.count({
        where: {
          tenantId,
          status: {
            in: ['draft', 'sent'],
          },
        },
      }),

      this.prisma.serviceOrder.count({
        where: {
          tenantId,
          status: {
            in: ['scheduled', 'in_progress'],
          },
        },
      }),

      this.prisma.receivable.count({
        where: {
          tenantId,
          status: {
            in: ['pending', 'partial'],
          },
          dueDate: {
            lt: new Date(),
          },
        },
      }),
    ]);

    return {
      pendingQuotations,
      activeOrders,
      overdueReceivables,
    };
  }

  /**
   * Métricas de performance do mês
   */
  async getMonthlyPerformance() {
    const tenantId = this.tenantContext.getTenantId();
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [ordersCompleted, revenue, newCustomers] = await Promise.all([
      this.prisma.serviceOrder.count({
        where: {
          tenantId,
          status: 'completed',
          completedAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      }),

      this.prisma.payment.aggregate({
        where: {
          receivable: {
            tenantId,
          },
          paidAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      this.prisma.customer.count({
        where: {
          tenantId,
          createdAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      }),
    ]);

    return {
      ordersCompleted,
      revenue: Number(revenue._sum.amount || 0),
      newCustomers,
      period: {
        start: firstDayOfMonth,
        end: lastDayOfMonth,
      },
    };
  }
}
