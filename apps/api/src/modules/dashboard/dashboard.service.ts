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

  /**
   * Histórico de receita dos últimos N meses
   */
  async getRevenueHistory(months: number = 6) {
    const tenantId = this.tenantContext.getTenantId();
    const now = new Date();
    const history = [];

    // Buscar dados dos últimos N meses
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const [paymentsReceived, receivablesCreated] = await Promise.all([
        // Valores recebidos no mês
        this.prisma.payment.aggregate({
          where: {
            receivable: {
              tenantId,
            },
            paidAt: {
              gte: firstDay,
              lte: lastDay,
            },
          },
          _sum: {
            amount: true,
          },
        }),

        // Valores a receber criados no mês
        this.prisma.receivable.aggregate({
          where: {
            tenantId,
            createdAt: {
              gte: firstDay,
              lte: lastDay,
            },
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

      history.push({
        month: monthDate.getMonth() + 1,
        year: monthDate.getFullYear(),
        label: monthDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        received: Number(paymentsReceived._sum.amount || 0),
        total: Number(receivablesCreated._sum.amount || 0),
      });
    }

    return history;
  }

  /**
   * Histórico de ordens dos últimos N meses
   */
  async getOrdersHistory(months: number = 6) {
    const tenantId = this.tenantContext.getTenantId();
    const now = new Date();
    const history = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const [created, completed, cancelled] = await Promise.all([
        this.prisma.serviceOrder.count({
          where: {
            tenantId,
            createdAt: {
              gte: firstDay,
              lte: lastDay,
            },
          },
        }),

        this.prisma.serviceOrder.count({
          where: {
            tenantId,
            status: 'completed',
            completedAt: {
              gte: firstDay,
              lte: lastDay,
            },
          },
        }),

        this.prisma.serviceOrder.count({
          where: {
            tenantId,
            status: 'cancelled',
            updatedAt: {
              gte: firstDay,
              lte: lastDay,
            },
          },
        }),
      ]);

      history.push({
        month: monthDate.getMonth() + 1,
        year: monthDate.getFullYear(),
        label: monthDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        created,
        completed,
        cancelled,
      });
    }

    return history;
  }

  /**
   * Top clientes por receita
   */
  async getTopCustomers(limit: number = 5) {
    const tenantId = this.tenantContext.getTenantId();
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Buscar todos os receivables com seus clientes
    const receivables = await this.prisma.receivable.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
      include: {
        serviceOrder: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Agrupar por cliente
    const customerMap = new Map<string, {
      id: string;
      name: string;
      totalRevenue: number;
      ordersCount: number;
    }>();

    for (const receivable of receivables) {
      if (!receivable.serviceOrder?.customer) continue;

      const customer = receivable.serviceOrder.customer;
      const revenue = Number(receivable.paidAmount || 0);

      if (customerMap.has(customer.id)) {
        const existing = customerMap.get(customer.id)!;
        existing.totalRevenue += revenue;
        existing.ordersCount += 1;
      } else {
        customerMap.set(customer.id, {
          id: customer.id,
          name: customer.name,
          totalRevenue: revenue,
          ordersCount: 1,
        });
      }
    }

    // Converter para array e ordenar por receita
    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    return topCustomers;
  }
}
