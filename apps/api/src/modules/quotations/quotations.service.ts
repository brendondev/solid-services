import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { CreateQuotationDto, UpdateQuotationDto } from './dto';
import { NotificationsService } from '../notifications';

/**
 * Service de Quotations (Orçamentos)
 *
 * Responsabilidades:
 * - Gerenciar orçamentos e seus itens
 * - Calcular totais automaticamente
 * - Gerar números sequenciais
 * - Validações de negócio
 *
 * Princípios SOLID aplicados:
 * - Single Responsibility: Apenas lógica de orçamentos
 * - Dependency Inversion: Depende de abstrações
 */
@Injectable()
export class QuotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Gera número sequencial para o orçamento
   */
  private async generateQuotationNumber(): Promise<string> {
    const tenantId = this.tenantContext.getTenantId();
    const year = new Date().getFullYear();

    const count = await this.prisma.quotation.count({
      where: {
        tenantId,
        number: {
          startsWith: `QT-${year}-`,
        },
      },
    });

    const nextNumber = count + 1;
    return `QT-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Calcula total do orçamento baseado nos itens
   */
  private calculateTotal(items: { quantity: number; unitPrice: number }[]): number {
    return items.reduce((total, item) => {
      return total + item.quantity * item.unitPrice;
    }, 0);
  }

  /**
   * Cria um novo orçamento
   */
  async create(createQuotationDto: CreateQuotationDto) {
    const tenantId = this.tenantContext.getTenantId();
    const number = await this.generateQuotationNumber();

    // Buscar serviços para popular descrições
    const serviceIds = createQuotationDto.items.map((item) => item.serviceId);
    const services = await this.prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        tenantId,
      },
    });

    if (services.length !== serviceIds.length) {
      throw new BadRequestException('One or more services not found');
    }

    // Preparar itens com descrições e totais
    const itemsData = createQuotationDto.items.map((item) => {
      const service = services.find((s) => s.id === item.serviceId);
      const totalPrice = item.quantity * item.unitPrice;

      return {
        serviceId: item.serviceId,
        description: item.description || service?.description || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        order: item.order,
      };
    });

    // Calcular total geral
    const totalAmount = this.calculateTotal(itemsData);

    return this.prisma.quotation.create({
      data: {
        tenantId,
        customerId: createQuotationDto.customerId,
        number,
        status: 'draft',
        totalAmount,
        validUntil: new Date(createQuotationDto.validUntil),
        notes: createQuotationDto.notes,
        items: {
          create: itemsData,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        items: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  /**
   * Lista todos os orçamentos com paginação
   */
  async findAll(page: number = 1, limit: number = 10, search?: string, status?: string) {
    const tenantId = this.tenantContext.getTenantId();
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [quotations, total] = await Promise.all([
      this.prisma.quotation.findMany({
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
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.quotation.count({ where }),
    ]);

    return {
      data: quotations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca um orçamento por ID
   */
  async findOne(id: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            contacts: true,
            addresses: true,
          },
        },
        items: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        serviceOrder: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    return quotation;
  }

  /**
   * Atualiza um orçamento
   */
  async update(id: string, updateQuotationDto: UpdateQuotationDto) {
    // Verificar se existe
    await this.findOne(id);

    return this.prisma.quotation.update({
      where: { id },
      data: {
        ...updateQuotationDto,
        validUntil: updateQuotationDto.validUntil
          ? new Date(updateQuotationDto.validUntil)
          : undefined,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        items: {
          include: {
            service: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  /**
   * Atualiza status do orçamento
   */
  async updateStatus(id: string, status: string) {
    const quotation = await this.findOne(id);

    const updated = await this.prisma.quotation.update({
      where: { id },
      data: { status },
      include: {
        customer: {
          include: {
            contacts: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        items: true,
      },
    });

    // Enviar notificação por email se status mudou para "sent"
    if (status === 'sent' && quotation.status !== 'sent') {
      const primaryContact = updated.customer.contacts[0];
      if (primaryContact?.email) {
        const portalUrl = `${process.env.PORTAL_URL || 'http://localhost:3001/portal'}/access?token=GENERATE_TOKEN_HERE`;

        try {
          await this.notificationsService.sendQuotationCreated({
            to: primaryContact.email,
            customerName: updated.customer.name,
            quotationNumber: updated.number,
            totalAmount: Number(updated.totalAmount),
            portalUrl,
          });
        } catch (error) {
          // Log error but don't fail the operation
          console.error('Failed to send quotation email:', error);
        }
      }
    }

    return updated;
  }

  /**
   * Remove um orçamento
   */
  async remove(id: string) {
    // Verificar se existe
    const quotation = await this.findOne(id);

    // Não permitir deletar se já foi aprovado
    if (quotation.status === 'approved') {
      throw new BadRequestException('Cannot delete approved quotation');
    }

    return this.prisma.quotation.delete({
      where: { id },
    });
  }

  /**
   * Busca orçamentos por cliente
   */
  async findByCustomer(customerId: string) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.quotation.findMany({
      where: {
        tenantId,
        customerId,
      },
      include: {
        items: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca orçamentos pendentes (draft ou sent)
   */
  async findPending() {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.quotation.findMany({
      where: {
        tenantId,
        status: {
          in: ['draft', 'sent'],
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
