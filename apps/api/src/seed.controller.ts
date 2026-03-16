import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { PrismaService } from './core/database/prisma.service';
import { Public } from './core/auth/decorators/public.decorator';
import * as bcrypt from 'bcrypt';

@Controller('dev')
export class SeedController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Post('seed')
  @HttpCode(HttpStatus.OK)
  async runSeed() {
    try {
      // Seed para popular banco de dados com dados mockup
      console.log('🌱 Iniciando seed via endpoint...');

      // Usar tenant existente
      const TENANT_ID = '1875be3a-c4c5-49fa-aba2-9df95fb152c5';

      console.log('📦 Verificando tenant existente...');
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: TENANT_ID },
      });

      if (!tenant) {
        return {
          success: false,
          message: 'Tenant não encontrado: ' + TENANT_ID,
        };
      }

      console.log('✅ Tenant encontrado:', tenant.name);

      // Criar ou buscar usuário admin
      console.log('👤 Criando usuário admin...');
      const passwordHash = await bcrypt.hash('123456', 10);

      let adminUser = await this.prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          email: 'admin@demo.com',
        },
      });

      if (!adminUser) {
        adminUser = await this.prisma.user.create({
          data: {
            tenantId: tenant.id,
            email: 'admin@demo.com',
            passwordHash,
            name: 'Administrador Demo',
            roles: ['admin'],
            status: 'active',
          },
        });
        console.log('✅ Admin criado: admin@demo.com');
      } else {
        console.log('ℹ️  Admin já existe: admin@demo.com');
      }

      // Criar ou buscar usuário técnico
      console.log('👷 Criando usuário técnico...');
      let techUser = await this.prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          email: 'tecnico@demo.com',
        },
      });

      if (!techUser) {
        techUser = await this.prisma.user.create({
          data: {
            tenantId: tenant.id,
            email: 'tecnico@demo.com',
            passwordHash,
            name: 'João Técnico',
            roles: ['technician'],
            status: 'active',
          },
        });
        console.log('✅ Técnico criado: tecnico@demo.com');
      } else {
        console.log('ℹ️  Técnico já existe: tecnico@demo.com');
      }

      // Criar catálogo de serviços
      console.log('🛠️  Criando catálogo de serviços...');

      const servicesList = [
        {
          name: 'Manutenção Preventiva',
          description: 'Manutenção preventiva completa de equipamentos',
          defaultPrice: 150.0,
          estimatedDuration: 120,
        },
        {
          name: 'Instalação de Equipamento',
          description: 'Instalação e configuração de equipamentos',
          defaultPrice: 200.0,
          estimatedDuration: 180,
        },
        {
          name: 'Reparo de Emergência',
          description: 'Reparo emergencial com atendimento prioritário',
          defaultPrice: 300.0,
          estimatedDuration: 240,
        },
        {
          name: 'Consultoria Técnica',
          description: 'Consultoria técnica especializada',
          defaultPrice: 250.0,
          estimatedDuration: 60,
        },
      ];

      const services = [];
      for (const svc of servicesList) {
        let service = await this.prisma.service.findFirst({
          where: {
            tenantId: tenant.id,
            name: svc.name,
          },
        });

        if (!service) {
          service = await this.prisma.service.create({
            data: {
              tenantId: tenant.id,
              ...svc,
              status: 'active',
            },
          });
          console.log(`✅ Serviço criado: ${service.name}`);
        } else {
          console.log(`ℹ️  Serviço já existe: ${service.name}`);
        }
        services.push(service);
      }

      // Criar clientes
      console.log('👥 Criando clientes...');
      let customer1 = await this.prisma.customer.findFirst({
        where: {
          tenantId: tenant.id,
          document: '123.456.789-00',
        },
      });

      if (!customer1) {
        customer1 = await this.prisma.customer.create({
          data: {
            tenantId: tenant.id,
            name: 'Maria Santos',
            type: 'individual',
            document: '123.456.789-00',
            status: 'active',
            notes: 'Cliente VIP',
            contacts: {
              create: [
                {
                  name: 'Maria Santos',
                  phone: '(11) 98765-4321',
                  email: 'maria.santos@email.com',
                  isPrimary: true,
                },
              ],
            },
            addresses: {
              create: [
                {
                  street: 'Rua das Flores',
                  number: '123',
                  district: 'Centro',
                  city: 'São Paulo',
                  state: 'SP',
                  zipCode: '01234-567',
                  isPrimary: true,
                },
              ],
            },
          },
        });
        console.log('✅ Cliente criado: Maria Santos');
      } else {
        console.log('ℹ️  Cliente já existe: Maria Santos');
      }

      let customer2 = await this.prisma.customer.findFirst({
        where: {
          tenantId: tenant.id,
          document: '12.345.678/0001-99',
        },
      });

      if (!customer2) {
        customer2 = await this.prisma.customer.create({
          data: {
            tenantId: tenant.id,
            name: 'Tech Solutions LTDA',
            type: 'company',
            document: '12.345.678/0001-99',
            status: 'active',
            contacts: {
              create: [
                {
                  name: 'Pedro Oliveira',
                  phone: '(11) 3456-7890',
                  email: 'pedro@techsolutions.com',
                  isPrimary: true,
                },
              ],
            },
            addresses: {
              create: [
                {
                  street: 'Av. Paulista',
                  number: '1000',
                  complement: 'Sala 501',
                  district: 'Bela Vista',
                  city: 'São Paulo',
                  state: 'SP',
                  zipCode: '01310-100',
                  isPrimary: true,
                },
              ],
            },
          },
        });
        console.log('✅ Cliente criado: Tech Solutions LTDA');
      } else {
        console.log('ℹ️  Cliente já existe: Tech Solutions LTDA');
      }

      // Criar orçamento
      console.log('📋 Criando orçamento...');
      const existingQuotation = await this.prisma.quotation.findFirst({
        where: {
          tenantId: tenant.id,
          number: 'QT-2024-001',
        },
      });

      if (!existingQuotation) {
        await this.prisma.quotation.create({
          data: {
            tenantId: tenant.id,
            customerId: customer1.id,
            number: 'QT-2024-001',
            status: 'sent',
            totalAmount: 350.0,
            validUntil: new Date('2024-12-31'),
            notes: 'Orçamento para manutenção preventiva + instalação',
            items: {
              create: [
                {
                  serviceId: services[0].id,
                  description: services[0].description || '',
                  quantity: 1,
                  unitPrice: 150.0,
                  totalPrice: 150.0,
                  order: 1,
                },
                {
                  serviceId: services[1].id,
                  description: services[1].description || '',
                  quantity: 1,
                  unitPrice: 200.0,
                  totalPrice: 200.0,
                  order: 2,
                },
              ],
            },
          },
        });
        console.log('✅ Orçamento criado: QT-2024-001');
      } else {
        console.log('ℹ️  Orçamento já existe: QT-2024-001');
      }

      // Criar ordem de serviço
      console.log('📝 Criando ordem de serviço...');
      const existingOrder = await this.prisma.serviceOrder.findFirst({
        where: {
          tenantId: tenant.id,
          number: 'OS-2024-001',
        },
      });

      if (!existingOrder) {
        const serviceOrder = await this.prisma.serviceOrder.create({
          data: {
            tenantId: tenant.id,
            customerId: customer2.id,
            number: 'OS-2024-001',
            status: 'scheduled',
            assignedTo: techUser.id,
            scheduledFor: new Date('2024-03-20T14:00:00'),
            totalAmount: 300.0,
            notes: 'Reparo emergencial agendado',
            items: {
              create: [
                {
                  serviceId: services[2].id,
                  description: services[2].description || '',
                  quantity: 1,
                  unitPrice: 300.0,
                  totalPrice: 300.0,
                  order: 1,
                },
              ],
            },
            timeline: {
              create: [
                {
                  event: 'created',
                  description: 'Ordem de serviço criada',
                },
                {
                  event: 'scheduled',
                  description: 'Agendado para 20/03/2024 às 14:00',
                },
              ],
            },
            checklists: {
              create: [
                {
                  title: 'Verificar equipamento',
                  isCompleted: false,
                  order: 1,
                },
                {
                  title: 'Testar funcionamento',
                  isCompleted: false,
                  order: 2,
                },
                {
                  title: 'Obter assinatura do cliente',
                  isCompleted: false,
                  order: 3,
                },
              ],
            },
          },
        });

        // Criar recebível
        console.log('💰 Criando recebível...');
        await this.prisma.receivable.create({
          data: {
            tenantId: tenant.id,
            serviceOrderId: serviceOrder.id,
            customerId: customer2.id,
            amount: 300.0,
            paidAmount: 0,
            status: 'pending',
            dueDate: new Date('2024-03-30'),
            notes: 'Pagamento referente à OS-2024-001',
          },
        });

        console.log('✅ Ordem de serviço criada: OS-2024-001');
      } else {
        console.log('ℹ️  Ordem de serviço já existe: OS-2024-001');
      }

      console.log('\n✅ Seed concluído com sucesso!');

      return {
        success: true,
        message: 'Seed executado com sucesso!',
        credentials: {
          admin: 'admin@demo.com / 123456',
          technician: 'tecnico@demo.com / 123456',
        },
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name,
        },
      };
    } catch (error) {
      console.error('❌ Erro ao executar seed:', error);
      return {
        success: false,
        message: 'Erro ao executar seed',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
