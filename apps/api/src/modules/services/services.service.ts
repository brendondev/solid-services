import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { CreateServiceDto, UpdateServiceDto } from './dto';

/**
 * Service de Services (Catálogo de Serviços)
 *
 * Responsabilidades:
 * - Gerenciar catálogo de serviços oferecidos
 * - Validações de negócio
 * - Controle de preços e durações
 *
 * Princípios SOLID aplicados:
 * - Single Responsibility: Apenas lógica de catálogo de serviços
 * - Dependency Inversion: Depende de abstrações (PrismaService)
 */
@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Cria um novo serviço no catálogo
   */
  async create(createServiceDto: CreateServiceDto) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.service.create({
      data: {
        ...createServiceDto,
        tenantId,
        status: createServiceDto.status || 'active',
      },
    });
  }

  /**
   * Lista todos os serviços com paginação e filtros
   */
  async findAll(page: number = 1, limit: number = 10, search?: string, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              quotationItems: true,
              orderItems: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data: services,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca um serviço por ID
   */
  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        quotationItems: {
          take: 5,
          orderBy: { quotation: { createdAt: 'desc' } },
          include: {
            quotation: {
              select: {
                id: true,
                number: true,
                status: true,
                customer: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        orderItems: {
          take: 5,
          orderBy: { serviceOrder: { createdAt: 'desc' } },
          include: {
            serviceOrder: {
              select: {
                id: true,
                number: true,
                status: true,
                customer: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            quotationItems: true,
            orderItems: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  /**
   * Atualiza um serviço
   */
  async update(id: string, updateServiceDto: UpdateServiceDto) {
    // Verificar se existe
    await this.findOne(id);

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  /**
   * Alterna o status de um serviço (ativo/inativo)
   */
  async toggleStatus(id: string) {
    const service = await this.findOne(id);

    return this.prisma.service.update({
      where: { id },
      data: {
        status: service.status === 'active' ? 'inactive' : 'active',
      },
    });
  }

  /**
   * Remove um serviço permanentemente
   */
  async remove(id: string) {
    await this.findOne(id);

    // Verificar se o serviço está sendo usado em algum item de orçamento ou ordem
    const [quotationItemsCount, orderItemsCount] = await Promise.all([
      this.prisma.quotationItem.count({
        where: { serviceId: id },
      }),
      this.prisma.orderItem.count({
        where: { serviceId: id },
      }),
    ]);

    if (quotationItemsCount > 0 || orderItemsCount > 0) {
      throw new BadRequestException(
        `Não é possível excluir este serviço pois ele está sendo usado em ${quotationItemsCount} orçamento(s) e ${orderItemsCount} ordem(ns). Inative-o ao invés de excluir.`
      );
    }

    try {
      return await this.prisma.service.delete({
        where: { id },
      });
    } catch (error: any) {
      console.error('Error deleting service:', error);
      throw new BadRequestException(
        `Não foi possível excluir o serviço: ${error.message || 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Busca apenas serviços ativos
   */
  async findActive() {
    return this.prisma.service.findMany({
      where: {
        status: 'active',
      },
      select: {
        id: true,
        name: true,
        description: true,
        defaultPrice: true,
        estimatedDuration: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Busca serviços mais utilizados
   */
  async findMostUsed(limit: number = 10) {
    const services = await this.prisma.service.findMany({
      where: {
        status: 'active',
      },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: {
        orderItems: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return services;
  }
}
