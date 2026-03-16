import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './core/database/prisma.service';
import { Public } from './core/auth/decorators/public.decorator';

@Controller('dev')
export class DebugController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get('debug')
  async debug() {
    try {
      // Buscar tenant
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: '1875be3a-c4c5-49fa-aba2-9df95fb152c5' },
      });

      // Buscar usuários
      const users = await this.prisma.user.findMany({
        where: { tenantId: '1875be3a-c4c5-49fa-aba2-9df95fb152c5' },
        select: { id: true, email: true, name: true, tenantId: true, roles: true },
      });

      // Buscar clientes
      const customers = await this.prisma.customer.findMany({
        where: { tenantId: '1875be3a-c4c5-49fa-aba2-9df95fb152c5' },
      });

      // Buscar serviços
      const services = await this.prisma.service.findMany({
        where: { tenantId: '1875be3a-c4c5-49fa-aba2-9df95fb152c5' },
      });

      // Buscar orçamentos
      const quotations = await this.prisma.quotation.findMany({
        where: { tenantId: '1875be3a-c4c5-49fa-aba2-9df95fb152c5' },
      });

      // Buscar ordens de serviço
      const orders = await this.prisma.serviceOrder.findMany({
        where: { tenantId: '1875be3a-c4c5-49fa-aba2-9df95fb152c5' },
      });

      // Buscar recebíveis
      const receivables = await this.prisma.receivable.findMany({
        where: { tenantId: '1875be3a-c4c5-49fa-aba2-9df95fb152c5' },
      });

      return {
        tenant,
        counts: {
          users: users.length,
          customers: customers.length,
          services: services.length,
          quotations: quotations.length,
          orders: orders.length,
          receivables: receivables.length,
        },
        users,
        customers: customers.map(c => ({ id: c.id, name: c.name, type: c.type, status: c.status })),
        services: services.map(s => ({ id: s.id, name: s.name })),
        quotations: quotations.map(q => ({ id: q.id, number: q.number, status: q.status })),
        orders: orders.map(o => ({ id: o.id, number: o.number, status: o.status })),
        receivables: receivables.map(r => ({ id: r.id, amount: Number(r.amount), status: r.status })),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
