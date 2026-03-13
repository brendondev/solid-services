import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';

/**
 * Audit Service
 *
 * Registra ações críticas no sistema para auditoria e rastreamento
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Registra uma ação no audit log
   */
  async log(params: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    changes?: any;
  }) {
    try {
      const tenantId = this.tenantContext.getTenantIdOrNull();

      if (!tenantId) {
        this.logger.warn('Tentativa de criar audit log sem tenant context');
        return;
      }

      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId: params.userId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          changes: params.changes || {},
        },
      });

      this.logger.debug(
        `Audit log created: ${params.action} on ${params.entity}:${params.entityId} by ${params.userId}`
      );
    } catch (error: any) {
      // Não falhar a operação principal se o log falhar
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
    }
  }

  /**
   * Registra criação de entidade
   */
  async logCreate(params: {
    userId: string;
    entity: string;
    entityId: string;
    data: any;
  }) {
    return this.log({
      userId: params.userId,
      action: 'CREATE',
      entity: params.entity,
      entityId: params.entityId,
      changes: { new: params.data },
    });
  }

  /**
   * Registra atualização de entidade
   */
  async logUpdate(params: {
    userId: string;
    entity: string;
    entityId: string;
    oldData: any;
    newData: any;
  }) {
    return this.log({
      userId: params.userId,
      action: 'UPDATE',
      entity: params.entity,
      entityId: params.entityId,
      changes: {
        old: params.oldData,
        new: params.newData,
      },
    });
  }

  /**
   * Registra deleção de entidade
   */
  async logDelete(params: {
    userId: string;
    entity: string;
    entityId: string;
    data: any;
  }) {
    return this.log({
      userId: params.userId,
      action: 'DELETE',
      entity: params.entity,
      entityId: params.entityId,
      changes: { deleted: params.data },
    });
  }

  /**
   * Registra mudança de status
   */
  async logStatusChange(params: {
    userId: string;
    entity: string;
    entityId: string;
    oldStatus: string;
    newStatus: string;
  }) {
    return this.log({
      userId: params.userId,
      action: 'STATUS_CHANGE',
      entity: params.entity,
      entityId: params.entityId,
      changes: {
        old: { status: params.oldStatus },
        new: { status: params.newStatus },
      },
    });
  }

  /**
   * Busca logs de auditoria com filtros
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    userId?: string;
    entity?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const tenantId = this.tenantContext.getTenantId();
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (params.userId) {
      where.userId = params.userId;
    }

    if (params.entity) {
      where.entity = params.entity;
    }

    if (params.action) {
      where.action = params.action;
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        where.createdAt.gte = params.startDate;
      }
      if (params.endDate) {
        where.createdAt.lte = params.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca logs de uma entidade específica
   */
  async findByEntity(entity: string, entityId: string) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.auditLog.findMany({
      where: {
        tenantId,
        entity,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca logs de um usuário específico
   */
  async findByUser(userId: string, page = 1, limit = 50) {
    const tenantId = this.tenantContext.getTenantId();
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: {
          tenantId,
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({
        where: { tenantId, userId },
      }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Estatísticas de auditoria
   */
  async getStats(startDate?: Date, endDate?: Date) {
    const tenantId = this.tenantContext.getTenantId();

    const where: any = { tenantId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [
      totalLogs,
      byAction,
      byEntity,
      byUser,
    ] = await Promise.all([
      // Total de logs
      this.prisma.auditLog.count({ where }),

      // Logs por ação
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: {
          action: true,
        },
      }),

      // Logs por entidade
      this.prisma.auditLog.groupBy({
        by: ['entity'],
        where,
        _count: {
          entity: true,
        },
      }),

      // Logs por usuário (top 10)
      this.prisma.auditLog.groupBy({
        by: ['userId'],
        where,
        _count: {
          userId: true,
        },
        orderBy: {
          _count: {
            userId: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    return {
      totalLogs,
      byAction: byAction.map((item) => ({
        action: item.action,
        count: item._count.action,
      })),
      byEntity: byEntity.map((item) => ({
        entity: item.entity,
        count: item._count.entity,
      })),
      topUsers: byUser.map((item) => ({
        userId: item.userId,
        count: item._count.userId,
      })),
    };
  }
}
