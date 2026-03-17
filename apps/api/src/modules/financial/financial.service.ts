import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { CreateReceivableDto, CreatePaymentDto, UpdateReceivableDto } from './dto';

@Injectable()
export class FinancialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Cria um recebível
   */
  async createReceivable(createReceivableDto: CreateReceivableDto) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.receivable.create({
      data: {
        tenantId,
        ...createReceivableDto,
        dueDate: new Date(createReceivableDto.dueDate),
        status: 'pending',
        paidAmount: 0,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        serviceOrder: {
          select: {
            id: true,
            number: true,
          },
        },
      },
    });
  }

  /**
   * Cria recebível automaticamente para ordem de serviço completada
   */
  async createFromServiceOrder(serviceOrderId: string) {
    const tenantId = this.tenantContext.getTenantId();

    const order = await this.prisma.serviceOrder.findFirst({
      where: {
        id: serviceOrderId,
        tenantId,
        status: 'completed',
      },
    });

    if (!order) {
      throw new NotFoundException('Completed service order not found');
    }

    // Verificar se já existe recebível
    const existing = await this.prisma.receivable.findFirst({
      where: {
        serviceOrderId,
      },
    });

    if (existing) {
      throw new BadRequestException('Receivable already exists for this order');
    }

    // Criar recebível com vencimento em 30 dias
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    return this.prisma.receivable.create({
      data: {
        tenantId,
        serviceOrderId: order.id,
        customerId: order.customerId,
        amount: order.totalAmount,
        paidAmount: 0,
        status: 'pending',
        dueDate,
        notes: `Referente à ${order.number}`,
      },
      include: {
        customer: true,
        serviceOrder: true,
      },
    });
  }

  /**
   * Lista recebíveis
   */
  async findAllReceivables(
    page: number = 1,
    limit: number = 10,
    status?: string,
    overdue?: boolean,
  ) {
    const tenantId = this.tenantContext.getTenantId();
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (status) {
      where.status = status;
    }

    if (overdue) {
      where.status = 'pending';
      where.dueDate = {
        lt: new Date(),
      };
    }

    const [receivables, total] = await Promise.all([
      this.prisma.receivable.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          serviceOrder: {
            select: {
              id: true,
              number: true,
            },
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
      }),
      this.prisma.receivable.count({ where }),
    ]);

    return {
      data: receivables,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca um recebível por ID
   */
  async findOneReceivable(id: string) {
    const receivable = await this.prisma.receivable.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            contacts: true,
          },
        },
        serviceOrder: true,
        payments: {
          include: {
            registeredUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            paidAt: 'desc',
          },
        },
      },
    });

    if (!receivable) {
      throw new NotFoundException(`Receivable with ID ${id} not found`);
    }

    return receivable;
  }

  /**
   * Atualiza um recebível
   */
  async updateReceivable(id: string, updateReceivableDto: UpdateReceivableDto) {
    await this.findOneReceivable(id);

    const data: any = { ...updateReceivableDto };

    if (updateReceivableDto.dueDate) {
      data.dueDate = new Date(updateReceivableDto.dueDate);
    }

    return this.prisma.receivable.update({
      where: { id },
      data,
      include: {
        customer: true,
        serviceOrder: true,
      },
    });
  }

  /**
   * Registra um pagamento
   */
  async registerPayment(receivableId: string, createPaymentDto: CreatePaymentDto, userId: string) {
    const receivable = await this.findOneReceivable(receivableId);

    // Verificar se valor não excede o pendente
    const pendingAmount = Number(receivable.amount) - Number(receivable.paidAmount);

    if (createPaymentDto.amount > pendingAmount) {
      throw new BadRequestException('Payment amount exceeds pending amount');
    }

    // Criar pagamento
    const payment = await this.prisma.payment.create({
      data: {
        receivableId,
        amount: createPaymentDto.amount,
        method: createPaymentDto.method,
        paidAt: new Date(createPaymentDto.paidAt),
        registeredBy: userId,
        notes: createPaymentDto.notes,
      },
      include: {
        registeredUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Atualizar recebível
    const newPaidAmount = Number(receivable.paidAmount) + createPaymentDto.amount;
    const isPaid = newPaidAmount >= Number(receivable.amount);

    await this.prisma.receivable.update({
      where: { id: receivableId },
      data: {
        paidAmount: newPaidAmount,
        status: isPaid ? 'paid' : 'partial',
        paidAt: isPaid ? new Date() : null,
      },
    });

    return payment;
  }

  /**
   * Remove um recebível
   */
  async removeReceivable(id: string) {
    const receivable = await this.findOneReceivable(id);

    if (Number(receivable.paidAmount) > 0) {
      throw new BadRequestException('Cannot delete receivable with payments');
    }

    return this.prisma.receivable.delete({
      where: { id },
    });
  }

  /**
   * Busca recebíveis por cliente
   */
  async findByCustomer(customerId: string) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.receivable.findMany({
      where: {
        tenantId,
        customerId,
      },
      include: {
        serviceOrder: {
          select: {
            id: true,
            number: true,
          },
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    });
  }

  /**
   * Dashboard financeiro
   */
  async getDashboard() {
    const tenantId = this.tenantContext.getTenantId();

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Total a receber (pending)
    const totalPending = await this.prisma.receivable.aggregate({
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
    });

    // Total recebido no mês
    const totalReceivedThisMonth = await this.prisma.payment.aggregate({
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
    });

    // Vencidos
    const overdue = await this.prisma.receivable.count({
      where: {
        tenantId,
        status: {
          in: ['pending', 'partial'],
        },
        dueDate: {
          lt: now,
        },
      },
    });

    const pendingAmount = Number(totalPending._sum.amount || 0) - Number(totalPending._sum.paidAmount || 0);

    return {
      pendingAmount,
      receivedThisMonth: Number(totalReceivedThisMonth._sum.amount || 0),
      overdueCount: overdue,
    };
  }
}
