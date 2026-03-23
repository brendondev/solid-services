import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';

export interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}

/**
 * Notifications Data Service
 *
 * Gerencia CRUD de notificações no banco de dados
 */
@Injectable()
export class NotificationsDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Cria uma nova notificação
   */
  async create(dto: CreateNotificationDto) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.notification.create({
      data: {
        tenantId,
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data || null,
      },
    });
  }

  /**
   * Cria notificações para múltiplos usuários
   */
  async createMany(dtos: CreateNotificationDto[]) {
    const tenantId = this.tenantContext.getTenantId();

    const notifications = dtos.map((dto) => ({
      tenantId,
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      data: dto.data || null,
    }));

    return this.prisma.notification.createMany({
      data: notifications,
    });
  }

  /**
   * Lista notificações de um usuário
   */
  async findByUser(userId: string, unreadOnly: boolean = false) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.notification.findMany({
      where: {
        tenantId,
        userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Últimas 50 notificações
    });
  }

  /**
   * Conta notificações não lidas
   */
  async countUnread(userId: string) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.notification.count({
      where: {
        tenantId,
        userId,
        read: false,
      },
    });
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: string) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.notification.update({
      where: {
        id: notificationId,
        tenantId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Marca todas notificações de um usuário como lidas
   */
  async markAllAsRead(userId: string) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.notification.updateMany({
      where: {
        tenantId,
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Deleta notificação
   */
  async delete(notificationId: string) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.notification.delete({
      where: {
        id: notificationId,
        tenantId,
      },
    });
  }

  /**
   * Deleta notificações antigas (mais de 30 dias)
   */
  async deleteOld() {
    const tenantId = this.tenantContext.getTenantId();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.notification.deleteMany({
      where: {
        tenantId,
        createdAt: {
          lt: thirtyDaysAgo,
        },
        read: true, // Só deleta as já lidas
      },
    });
  }
}
