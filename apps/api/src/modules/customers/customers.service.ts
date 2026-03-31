import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';

/**
 * Service de Customers
 *
 * Responsabilidades:
 * - Lógica de negócio relacionada a clientes
 * - Validações de negócio
 * - Orquestração de operações
 *
 * Princípios SOLID aplicados:
 * - Single Responsibility: Apenas lógica de clientes
 * - Dependency Inversion: Depende de PrismaService (abstração)
 * - Open/Closed: Pode ser estendido sem modificar código existente
 */
@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Cria um novo cliente
   */
  async create(createCustomerDto: CreateCustomerDto) {
    const { contacts = [], addresses = [], ...customerData } = createCustomerDto;
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.customer.create({
      data: {
        ...customerData,
        tenantId,
        status: 'active',
        contacts: contacts
          ? {
              create: contacts,
            }
          : undefined,
        addresses: addresses
          ? {
              create: addresses,
            }
          : undefined,
      },
      include: {
        contacts: true,
        addresses: true,
      },
    });
  }

  /**
   * Verifica se um email já está cadastrado e retorna o cliente
   */
  async checkDuplicateEmail(email: string) {
    const tenantId = this.tenantContext.getTenantId();

    const existingCustomer = await this.prisma.customer.findFirst({
      where: {
        tenantId,
        contacts: {
          some: {
            email: {
              equals: email,
              mode: 'insensitive',
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        document: true,
      },
    });

    return existingCustomer;
  }

  /**
   * Lista todos os clientes com paginação
   */
  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const tenantId = this.tenantContext.getTenantId();
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { document: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        include: {
          contacts: true,
          addresses: true,
          _count: {
            select: {
              quotations: true,
              serviceOrders: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca um cliente por ID
   */
  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        contacts: true,
        addresses: true,
        quotations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        serviceOrders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  /**
   * Atualiza um cliente
   */
  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    // Verificar se existe
    await this.findOne(id);

    const { contacts: _contacts, addresses: _addresses, ...customerData } = updateCustomerDto;

    return this.prisma.customer.update({
      where: { id },
      data: {
        ...customerData,
        // Nota: Para simplificar, não estamos atualizando contacts e addresses aqui
        // Em produção, seria necessário lógica mais complexa para gerenciar relacionamentos
      },
      include: {
        contacts: true,
        addresses: true,
      },
    });
  }

  /**
   * Remove um cliente (soft delete via status)
   */
  async remove(id: string) {
    // Verificar se existe
    await this.findOne(id);

    return this.prisma.customer.update({
      where: { id },
      data: {
        status: 'inactive',
      },
    });
  }

  /**
   * Alterna o status do cliente (ativo/inativo)
   */
  async toggleStatus(id: string) {
    const customer = await this.findOne(id);

    return this.prisma.customer.update({
      where: { id },
      data: {
        status: customer.status === 'active' ? 'inactive' : 'active',
      },
    });
  }

  /**
   * Deleta permanentemente um cliente
   * Só permite se não houver orçamentos, ordens ou recebíveis associados
   */
  async delete(id: string) {
    // Verificar se existe
    await this.findOne(id);

    // Buscar dependências (limitado a 5 de cada tipo)
    const [quotations, orders, receivables] = await Promise.all([
      this.prisma.quotation.findMany({
        where: { customerId: id },
        select: {
          id: true,
          number: true,
          totalAmount: true,
          status: true,
        },
        take: 5,
      }),
      this.prisma.serviceOrder.findMany({
        where: { customerId: id },
        select: {
          id: true,
          number: true,
          totalAmount: true,
          status: true,
        },
        take: 5,
      }),
      this.prisma.receivable.findMany({
        where: { customerId: id },
        select: {
          id: true,
          notes: true,
          amount: true,
          status: true,
        },
        take: 5,
      }),
    ]);

    if (quotations.length > 0 || orders.length > 0 || receivables.length > 0) {
      // Construir array de links para os registros vinculados
      const links = [
        ...quotations.map(q => ({
          id: q.id,
          label: `Orçamento ${q.number} - R$ ${q.totalAmount}`,
          type: 'quotation',
        })),
        ...orders.map(o => ({
          id: o.id,
          label: `Ordem ${o.number} - R$ ${o.totalAmount}`,
          type: 'order',
        })),
        ...receivables.map(r => ({
          id: r.id,
          label: r.notes || `Recebível de R$ ${r.amount}`,
          type: 'receivable',
        })),
      ];

      throw new BadRequestException({
        message: 'Não é possível excluir cliente que possui registros vinculados',
        links,
        total: quotations.length + orders.length + receivables.length,
      });
    }

    // Deletar permanentemente
    return this.prisma.customer.delete({
      where: { id },
    });
  }

  /**
   * Busca clientes ativos
   */
  async findActive() {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.customer.findMany({
      where: {
        tenantId,
        status: 'active',
      },
      select: {
        id: true,
        name: true,
        type: true,
        document: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Atualiza contato de um cliente
   */
  async updateContact(
    customerId: string,
    contactId: string,
    updateData: any,
  ) {
    const tenantId = this.tenantContext.getTenantId();

    // Verificar se o cliente pertence ao tenant
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Se está marcando como primário, desmarcar outros
    if (updateData.isPrimary) {
      await this.prisma.customerContact.updateMany({
        where: {
          customerId,
          id: { not: contactId },
        },
        data: { isPrimary: false },
      });
    }

    return this.prisma.customerContact.update({
      where: { id: contactId },
      data: updateData,
    });
  }

  /**
   * Atualiza endereço de um cliente
   */
  async updateAddress(
    customerId: string,
    addressId: string,
    updateData: any,
  ) {
    const tenantId = this.tenantContext.getTenantId();

    // Verificar se o cliente pertence ao tenant
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Se está marcando como primário, desmarcar outros
    if (updateData.isPrimary) {
      await this.prisma.customerAddress.updateMany({
        where: {
          customerId,
          id: { not: addressId },
        },
        data: { isPrimary: false },
      });
    }

    return this.prisma.customerAddress.update({
      where: { id: addressId },
      data: updateData,
    });
  }
}
