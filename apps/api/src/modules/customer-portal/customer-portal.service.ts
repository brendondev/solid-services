import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { v4 as uuidv4 } from 'uuid';
import { NotificationsService } from '../notifications';
import { QuotationPdfService } from '../quotations/services/quotation-pdf.service';
import { OrderPdfService } from '../service-orders/services/order-pdf.service';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly notificationsService: NotificationsService,
    private readonly quotationPdfService: QuotationPdfService,
    private readonly orderPdfService: OrderPdfService,
  ) {}

  /**
   * Gera token de acesso para um cliente
   * Token permanente até ser revogado pelo admin
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

    // Verificar se já existe um token ativo (não revogado)
    const existingToken = await this.prisma.customerPortalToken.findFirst({
      where: {
        customerId: customer.id,
        tenantId,
        revokedAt: null,
      },
      orderBy: {
        generatedAt: 'desc',
      },
    });

    // Se já existe token ativo, retornar ele
    if (existingToken) {
      return existingToken.token;
    }

    // Gerar novo token único
    const token = uuidv4();

    // Salvar token no banco de dados (sem expiração)
    await this.prisma.customerPortalToken.create({
      data: {
        token,
        customerId: customer.id,
        tenantId,
        isValidated: false, // Cliente precisa validar no primeiro acesso
      },
    });

    return token;
  }

  /**
   * Valida token e retorna dados do cliente
   * Marca como validado no primeiro uso
   * Requer 4 primeiros dígitos do CPF/CNPJ para segurança
   */
  async validateToken(token: string, documentDigits?: string) {
    // Buscar token no banco de dados
    const tokenData = await this.prisma.customerPortalToken.findUnique({
      where: { token },
      include: {
        customer: {
          select: {
            id: true,
            tenantId: true,
            name: true,
            status: true,
            document: true, // Necessário para validar dígitos
          },
        },
      },
    });

    if (!tokenData) {
      throw new UnauthorizedException('Token inválido');
    }

    // Verificar se foi revogado
    if (tokenData.revokedAt) {
      throw new UnauthorizedException('Token revogado pelo administrador');
    }

    // Verificar se cliente está ativo
    if (!tokenData.customer || tokenData.customer.status !== 'active') {
      throw new UnauthorizedException('Cliente inativo');
    }

    // SEGURANÇA: Validar 4 primeiros dígitos do CPF/CNPJ
    if (documentDigits) {
      const customerDocument = tokenData.customer.document;

      if (!customerDocument) {
        throw new UnauthorizedException('Cliente sem documento cadastrado');
      }

      // Extrair apenas números do documento
      const documentNumbers = customerDocument.replace(/\D/g, '');
      const first4Digits = documentNumbers.substring(0, 4);

      if (documentDigits !== first4Digits) {
        throw new UnauthorizedException('Dígitos do documento incorretos');
      }
    }

    // Se é o primeiro uso, marcar como validado (só se passou pela validação de dígitos)
    const updateData: any = {
      lastUsedAt: new Date(),
    };

    if (!tokenData.isValidated && documentDigits) {
      // Só marca como validado se forneceu os dígitos corretos
      updateData.isValidated = true;
      updateData.validatedAt = new Date();
    }

    // Atualizar token
    await this.prisma.customerPortalToken.update({
      where: { id: tokenData.id },
      data: updateData,
    });

    // Não retornar o documento no response (segurança)
    const { document, ...customerWithoutDocument } = tokenData.customer;
    return customerWithoutDocument;
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

  /**
   * Gera PDF do orçamento
   */
  async generateQuotationPdf(
    quotationId: string,
    customerId: string,
    tenantId: string,
  ): Promise<Buffer> {
    const quotation = await this.getQuotation(quotationId, customerId, tenantId);
    return this.quotationPdfService.generateQuotationPdf(quotation);
  }

  /**
   * Gera PDF da ordem de serviço
   */
  async generateOrderPdf(
    orderId: string,
    customerId: string,
    tenantId: string,
  ): Promise<Buffer> {
    const order = await this.getOrder(orderId, customerId, tenantId);
    return this.orderPdfService.generateOrderPdf(order);
  }

  /**
   * Revoga (cancela) token de acesso ao portal
   */
  async revokeToken(customerId: string): Promise<void> {
    const tenantId = this.tenantContext.getTenantId();

    // Revogar todos os tokens ativos do cliente
    await this.prisma.customerPortalToken.updateMany({
      where: {
        customerId,
        tenantId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Obtém informações do token de um cliente
   */
  async getCustomerToken(customerId: string) {
    const tenantId = this.tenantContext.getTenantId();

    const token = await this.prisma.customerPortalToken.findFirst({
      where: {
        customerId,
        tenantId,
        revokedAt: null,
      },
      orderBy: {
        generatedAt: 'desc',
      },
    });

    if (!token) {
      return null;
    }

    return {
      token: token.token,
      generatedAt: token.generatedAt,
      isValidated: token.isValidated,
      validatedAt: token.validatedAt,
      lastUsedAt: token.lastUsedAt,
    };
  }
}
