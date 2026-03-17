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
   * Lista todos os clientes com paginação
   */
  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { document: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

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

    // Verificar se há dependências
    const [quotationsCount, ordersCount, receivablesCount] = await Promise.all([
      this.prisma.quotation.count({ where: { customerId: id } }),
      this.prisma.serviceOrder.count({ where: { customerId: id } }),
      this.prisma.receivable.count({ where: { customerId: id } }),
    ]);

    if (quotationsCount > 0 || ordersCount > 0 || receivablesCount > 0) {
      throw new BadRequestException(
        `Não é possível excluir este cliente pois ele possui ${quotationsCount} orçamento(s), ${ordersCount} ordem(ns) e ${receivablesCount} recebível(is). Inative-o ao invés de excluir.`
      );
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
    return this.prisma.customer.findMany({
      where: {
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
}
