import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { CreateSupplierDto, UpdateSupplierDto } from './dto';

/**
 * Service de gestão de fornecedores
 *
 * Responsável por:
 * - CRUD de fornecedores
 * - Validação de duplicidade de documento
 * - Listagem de fornecedores ativos
 *
 * Princípios SOLID:
 * - Single Responsibility: Apenas gestão de fornecedores
 * - Dependency Inversion: Depende de abstrações (PrismaService, TenantContextService)
 */
@Injectable()
export class SuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Cria um fornecedor
   */
  async create(createSupplierDto: CreateSupplierDto) {
    const tenantId = this.tenantContext.getTenantId();

    // Validar duplicidade de documento
    if (createSupplierDto.document) {
      const existing = await this.prisma.supplier.findFirst({
        where: {
          tenantId,
          document: createSupplierDto.document,
        },
      });

      if (existing) {
        throw new ConflictException('Supplier with this document already exists');
      }
    }

    return this.prisma.supplier.create({
      data: {
        tenantId,
        ...createSupplierDto,
        status: 'active',
      },
    });
  }

  /**
   * Lista fornecedores com paginação
   */
  async findAll(page: number = 1, limit: number = 10, status?: string) {
    const tenantId = this.tenantContext.getTenantId();
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (status) {
      where.status = status;
    }

    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              payables: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      data: suppliers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lista fornecedores ativos (sem paginação)
   */
  async findActive() {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.supplier.findMany({
      where: {
        tenantId,
        status: 'active',
      },
      select: {
        id: true,
        name: true,
        document: true,
        phone: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Busca um fornecedor por ID
   */
  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        payables: {
          select: {
            id: true,
            description: true,
            amount: true,
            paidAmount: true,
            status: true,
            dueDate: true,
          },
          orderBy: {
            dueDate: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            payables: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  /**
   * Atualiza um fornecedor
   */
  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    await this.findOne(id);

    // Validar duplicidade de documento se estiver sendo alterado
    if (updateSupplierDto.document) {
      const tenantId = this.tenantContext.getTenantId();
      const existing = await this.prisma.supplier.findFirst({
        where: {
          tenantId,
          document: updateSupplierDto.document,
          id: {
            not: id,
          },
        },
      });

      if (existing) {
        throw new ConflictException('Supplier with this document already exists');
      }
    }

    return this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  /**
   * Remove um fornecedor
   */
  async remove(id: string) {
    const supplier = await this.findOne(id);

    // Verificar se tem contas a pagar associadas
    if (supplier._count.payables > 0) {
      throw new ConflictException('Cannot delete supplier with associated payables');
    }

    return this.prisma.supplier.delete({
      where: { id },
    });
  }
}
