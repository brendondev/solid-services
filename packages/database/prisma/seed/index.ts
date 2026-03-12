import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Limpar dados existentes (apenas em desenvolvimento!)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🗑️  Cleaning existing data...');
    await prisma.payment.deleteMany();
    await prisma.receivable.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.orderChecklist.deleteMany();
    await prisma.orderTimeline.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.serviceOrder.deleteMany();
    await prisma.quotationItem.deleteMany();
    await prisma.quotation.deleteMany();
    await prisma.service.deleteMany();
    await prisma.customerAddress.deleteMany();
    await prisma.customerContact.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
  }

  // Criar Tenant de demonstração
  console.log('👔 Creating demo tenant...');
  const tenant = await prisma.tenant.create({
    data: {
      slug: 'demo-company',
      name: 'Demo Company - Serviços Técnicos',
      status: 'active',
      settings: {
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
      },
    },
  });

  // Criar usuário admin
  console.log('👤 Creating admin user...');
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@democompany.com',
      passwordHash,
      name: 'Admin User',
      roles: ['admin'],
      status: 'active',
    },
  });

  // Criar usuário técnico
  console.log('👷 Creating technician user...');
  const techUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'tecnico@democompany.com',
      passwordHash: await bcrypt.hash('tecnico123', 10),
      name: 'João Silva',
      roles: ['technician'],
      status: 'active',
    },
  });

  // Criar catálogo de serviços
  console.log('🛠️  Creating services catalog...');
  const services = await Promise.all([
    prisma.service.create({
      data: {
        tenantId: tenant.id,
        name: 'Manutenção Preventiva',
        description: 'Manutenção preventiva completa de equipamentos',
        defaultPrice: 150.00,
        estimatedDuration: 120,
        status: 'active',
      },
    }),
    prisma.service.create({
      data: {
        tenantId: tenant.id,
        name: 'Instalação de Equipamento',
        description: 'Instalação e configuração de equipamentos',
        defaultPrice: 200.00,
        estimatedDuration: 180,
        status: 'active',
      },
    }),
    prisma.service.create({
      data: {
        tenantId: tenant.id,
        name: 'Reparo de Emergência',
        description: 'Reparo emergencial com atendimento prioritário',
        defaultPrice: 300.00,
        estimatedDuration: 240,
        status: 'active',
      },
    }),
  ]);

  // Criar clientes
  console.log('👥 Creating customers...');
  const customer1 = await prisma.customer.create({
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

  const customer2 = await prisma.customer.create({
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

  // Criar orçamento
  console.log('📋 Creating quotation...');
  await prisma.quotation.create({
    data: {
      tenantId: tenant.id,
      customerId: customer1.id,
      number: 'QT-2024-001',
      status: 'sent',
      totalAmount: 350.00,
      validUntil: new Date('2024-12-31'),
      notes: 'Orçamento para manutenção preventiva + instalação',
      items: {
        create: [
          {
            serviceId: services[0].id,
            description: services[0].description || '',
            quantity: 1,
            unitPrice: 150.00,
            totalPrice: 150.00,
            order: 1,
          },
          {
            serviceId: services[1].id,
            description: services[1].description || '',
            quantity: 1,
            unitPrice: 200.00,
            totalPrice: 200.00,
            order: 2,
          },
        ],
      },
    },
  });

  // Criar ordem de serviço
  console.log('📝 Creating service order...');
  const serviceOrder = await prisma.serviceOrder.create({
    data: {
      tenantId: tenant.id,
      customerId: customer2.id,
      number: 'OS-2024-001',
      status: 'scheduled',
      assignedTo: techUser.id,
      scheduledFor: new Date('2024-03-15T14:00:00'),
      totalAmount: 300.00,
      notes: 'Reparo emergencial agendado',
      items: {
        create: [
          {
            serviceId: services[2].id,
            description: services[2].description || '',
            quantity: 1,
            unitPrice: 300.00,
            totalPrice: 300.00,
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
            description: 'Agendado para 15/03/2024 às 14:00',
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
  console.log('💰 Creating receivable...');
  await prisma.receivable.create({
    data: {
      tenantId: tenant.id,
      serviceOrderId: serviceOrder.id,
      customerId: customer2.id,
      amount: 300.00,
      paidAmount: 0,
      status: 'pending',
      dueDate: new Date('2024-03-30'),
      notes: 'Pagamento referente à OS-2024-001',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Demo credentials:');
  console.log('  Admin: admin@democompany.com / admin123');
  console.log('  Technician: tecnico@democompany.com / tecnico123');
  console.log('\n🏢 Tenant: demo-company');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
