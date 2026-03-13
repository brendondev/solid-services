import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { v4 as uuidv4 } from 'uuid';
import { NotificationsService } from '../notifications';

/**
 * Customer Portal Service
 *
 * Permite que clientes acessem:
 * - Orçamentos pendentes
 * - Aprovação/rejeição de orçamentos
 * - Ordens em andamento
 * - Histórico de serviços
 *
 * Autenticação via token único do cliente
 */
@Injectable()
export class CustomerPortalService {
  // Armazenamento temporário de tokens (para MVP)
  // TODO: Migrar para banco de dados em produção
  private readonly tokenMap = new Map<string, { customerId: string; tenantId: string; generatedAt: Date }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Gera token de acesso para um cliente
   */
  async generateAccessToken(customerId: string): Promise<string> {
    const tenantId = this.tenantContext.getTenantId();

    // Verificar se cliente existe
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId,
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Gerar token único
    const token = uuidv4();

    // Armazenar token no mapa (memória)
    this.tokenMap.set(token, {
      customerId: customer.id,
      tenantId,
      generatedAt: new Date(),
    });

    return token;
  }

  /**
   * Valida token e retorna dados do cliente
   */
  async validateToken(token: string) {
    // Buscar token no mapa
    const tokenData = this.tokenMap.get(token);

    if (!tokenData) {
      throw new UnauthorizedException('Token inválido');
    }

    // Verificar expiração (7 dias)
    const daysSinceGenerated = (Date.now() - tokenData.generatedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceGenerated > 7) {
      this.tokenMap.delete(token);
      throw new UnauthorizedException('Token expirado');
    }

    // Buscar dados do cliente
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: tokenData.customerId,
        tenantId: tokenData.tenantId,
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
        status: true,
      },
    });

    if (!customer || customer.status !== 'active') {
      throw new UnauthorizedException('Cliente inativo');
    }

    return customer;
  }

  /**
   * Lista orçamentos do cliente
   */
  async getCustomerQuotations(customerId: string, tenantId: string) {
    return this.prisma.quotation.findMany({
      where: {
        customerId,
        tenantId,
        status: {
          in: ['sent', 'approved', 'rejected'], // Não mostrar drafts
        },
      },
      include: {
        items: {
          include: {
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca um orçamento específico
   */
  async getQuotation(quotationId: string, customerId: string, tenantId: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: {
        id: quotationId,
        customerId,
        tenantId,
      },
      include: {
        items: {
          include: {
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!quotation) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    return quotation;
  }

  /**
   * Aprova um orçamento
   */
  async approveQuotation(quotationId: string, customerId: string, tenantId: string) {
    // Verificar se orçamento pertence ao cliente
    const quotation = await this.prisma.quotation.findFirst({
      where: {
        id: quotationId,
        customerId,
        tenantId,
        status: 'sent', // Só pode aprovar se status for "sent"
      },
      include: {
        customer: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException('Orçamento não encontrado ou não pode ser aprovado');
    }

    // Atualizar status
    const updated = await this.prisma.quotation.update({
      where: { id: quotationId },
      data: {
        status: 'approved',
      },
    });

    // Notificar administradores do tenant
    try {
      const admins = await this.prisma.user.findMany({
        where: {
          tenantId,
          roles: { has: 'admin' },
          status: 'active',
        },
        select: { email: true },
      });

      for (const admin of admins) {
        await this.notificationsService.sendQuotationApproved({
          to: admin.email,
          customerName: quotation.customer.name,
          quotationNumber: quotation.number,
          totalAmount: Number(quotation.totalAmount),
        });
      }
    } catch (error) {
      console.error('Failed to send approval notification:', error);
    }

    return updated;
  }

  /**
   * Rejeita um orçamento
   */
  async rejectQuotation(quotationId: string, customerId: string, tenantId: string) {
    // Verificar se orçamento pertence ao cliente
    const quotation = await this.prisma.quotation.findFirst({
      where: {
        id: quotationId,
        customerId,
        tenantId,
        status: 'sent',
      },
      include: {
        customer: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException('Orçamento não encontrado ou não pode ser rejeitado');
    }

    // Atualizar status
    const updated = await this.prisma.quotation.update({
      where: { id: quotationId },
      data: {
        status: 'rejected',
      },
    });

    // Notificar administradores do tenant
    try {
      const admins = await this.prisma.user.findMany({
        where: {
          tenantId,
          roles: { has: 'admin' },
          status: 'active',
        },
        select: { email: true },
      });

      for (const admin of admins) {
        await this.notificationsService.sendQuotationRejected({
          to: admin.email,
          customerName: quotation.customer.name,
          quotationNumber: quotation.number,
        });
      }
    } catch (error) {
      console.error('Failed to send rejection notification:', error);
    }

    return updated;
  }

  /**
   * Lista ordens do cliente
   */
  async getCustomerOrders(customerId: string, tenantId: string) {
    return this.prisma.serviceOrder.findMany({
      where: {
        customerId,
        tenantId,
      },
      include: {
        items: true,
        timeline: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Últimos 5 eventos
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca uma ordem específica
   */
  async getOrder(orderId: string, customerId: string, tenantId: string) {
    const order = await this.prisma.serviceOrder.findFirst({
      where: {
        id: orderId,
        customerId,
        tenantId,
      },
      include: {
        items: true,
        timeline: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        checklists: true,
        attachments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Ordem não encontrada');
    }

    return order;
  }

  /**
   * Histórico de serviços do cliente
   */
  async getServiceHistory(customerId: string, tenantId: string) {
    return this.prisma.serviceOrder.findMany({
      where: {
        customerId,
        tenantId,
        status: 'completed',
      },
      include: {
        items: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 20, // Últimos 20 serviços
    });
  }
}
