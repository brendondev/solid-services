import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';

/**
 * Scheduling Service
 *
 * Gerencia agendamentos de ordens de serviço:
 * - Verificação de disponibilidade
 * - Detecção de conflitos
 * - Sugestão de horários
 * - Visão de agenda (dia/semana)
 */
@Injectable()
export class SchedulingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Busca agenda do dia para um técnico
   */
  async getDaySchedule(technicianId: string, date: Date) {
    const tenantId = this.tenantContext.getTenantId();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Só filtrar por assignedTo se technicianId não for 'all' ou vazio
    const where: any = {
      tenantId,
      scheduledFor: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ['scheduled', 'in_progress'],
      },
    };

    if (technicianId && technicianId !== '' && technicianId !== 'all') {
      where.assignedTo = technicianId;
    }

    return this.prisma.serviceOrder.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });
  }

  /**
   * Busca agenda da semana para um técnico
   */
  async getWeekSchedule(technicianId: string, startDate: Date) {
    const tenantId = this.tenantContext.getTenantId();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    // Só filtrar por assignedTo se technicianId não for 'all' ou vazio
    const where: any = {
      tenantId,
      scheduledFor: {
        gte: startDate,
        lt: endDate,
      },
      status: {
        in: ['scheduled', 'in_progress'],
      },
    };

    if (technicianId && technicianId !== '' && technicianId !== 'all') {
      where.assignedTo = technicianId;
    }

    return this.prisma.serviceOrder.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });
  }

  /**
   * Verifica se um horário está disponível para um técnico
   */
  async checkAvailability(
    technicianId: string,
    scheduledFor: Date,
    durationMinutes: number = 60,
    excludeOrderId?: string,
  ): Promise<{ available: boolean; conflicts?: any[] }> {
    const tenantId = this.tenantContext.getTenantId();

    const startTime = new Date(scheduledFor);
    const endTime = new Date(scheduledFor);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);

    // Buscar ordens que podem conflitar
    const conflicts = await this.prisma.serviceOrder.findMany({
      where: {
        tenantId,
        assignedTo: technicianId,
        id: excludeOrderId ? { not: excludeOrderId } : undefined,
        status: {
          in: ['scheduled', 'in_progress'],
        },
        scheduledFor: {
          gte: new Date(startTime.getTime() - 2 * 60 * 60 * 1000), // 2h antes
          lte: new Date(endTime.getTime() + 2 * 60 * 60 * 1000), // 2h depois
        },
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    // Verificar sobreposição real
    const hasConflict = conflicts.some((order) => {
      if (!order.scheduledFor) return false;

      const orderStart = new Date(order.scheduledFor);
      const orderEnd = new Date(orderStart);
      orderEnd.setMinutes(orderEnd.getMinutes() + 60); // Duração padrão

      // Verifica se há sobreposição
      return (
        (startTime >= orderStart && startTime < orderEnd) ||
        (endTime > orderStart && endTime <= orderEnd) ||
        (startTime <= orderStart && endTime >= orderEnd)
      );
    });

    return {
      available: !hasConflict,
      conflicts: hasConflict ? conflicts : undefined,
    };
  }

  /**
   * Sugere próximos horários disponíveis para um técnico
   */
  async suggestAvailableSlots(
    technicianId: string,
    startDate: Date,
    numberOfSlots: number = 5,
  ) {
    const tenantId = this.tenantContext.getTenantId();
    const slots: Array<{ datetime: Date; available: boolean }> = [];

    // Horário comercial: 8h às 18h
    const workStartHour = 8;
    const workEndHour = 18;
    const slotDuration = 60; // minutos

    let currentDate = new Date(startDate);
    currentDate.setHours(workStartHour, 0, 0, 0);

    // Buscar todas as ordens agendadas nos próximos 7 dias
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const scheduledOrders = await this.prisma.serviceOrder.findMany({
      where: {
        tenantId,
        assignedTo: technicianId,
        scheduledFor: {
          gte: startDate,
          lt: endDate,
        },
        status: {
          in: ['scheduled', 'in_progress'],
        },
      },
      select: {
        scheduledFor: true,
      },
    });

    // Gerar slots até encontrar a quantidade solicitada
    while (slots.filter((s) => s.available).length < numberOfSlots) {
      // Pular finais de semana (opcional)
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Não é domingo nem sábado

        // Verificar se está dentro do horário comercial
        const hour = currentDate.getHours();
        if (hour >= workStartHour && hour < workEndHour) {
          // Verificar se há conflito
          const hasConflict = scheduledOrders.some((order) => {
            if (!order.scheduledFor) return false;
            const orderTime = new Date(order.scheduledFor);
            const diff = Math.abs(currentDate.getTime() - orderTime.getTime());
            return diff < slotDuration * 60 * 1000; // Menos de 1 hora de diferença
          });

          slots.push({
            datetime: new Date(currentDate),
            available: !hasConflict,
          });
        }
      }

      // Avançar para o próximo slot
      currentDate.setMinutes(currentDate.getMinutes() + slotDuration);

      // Se passou das 18h, ir para o dia seguinte às 8h
      if (currentDate.getHours() >= workEndHour) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(workStartHour, 0, 0, 0);
      }

      // Limite de segurança: não gerar mais de 100 slots
      if (slots.length > 100) break;
    }

    return slots.filter((s) => s.available).slice(0, numberOfSlots);
  }

  /**
   * Busca estatísticas de agendamento
   */
  async getSchedulingStats(technicianId?: string) {
    const tenantId = this.tenantContext.getTenantId();
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const where: any = {
      tenantId,
      status: {
        in: ['scheduled', 'in_progress'],
      },
    };

    if (technicianId) {
      where.assignedTo = technicianId;
    }

    const [todayCount, weekCount, total] = await Promise.all([
      this.prisma.serviceOrder.count({
        where: {
          ...where,
          scheduledFor: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      this.prisma.serviceOrder.count({
        where: {
          ...where,
          scheduledFor: {
            gte: startOfWeek,
            lt: endOfWeek,
          },
        },
      }),
      this.prisma.serviceOrder.count({
        where: {
          ...where,
          scheduledFor: {
            gte: now,
          },
        },
      }),
    ]);

    return {
      today: todayCount,
      thisWeek: weekCount,
      upcoming: total,
    };
  }
}
