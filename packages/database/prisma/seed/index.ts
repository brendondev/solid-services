import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Usar tenant existente
  const TENANT_ID = '1875be3a-c4c5-49fa-aba2-9df95fb152c5';

  console.log('📦 Verificando tenant existente...');
  const tenant = await prisma.tenant.findUnique({
    where: { id: TENANT_ID },
  });

  if (!tenant) {
    console.error('❌ Tenant não encontrado:', TENANT_ID);
    process.exit(1);
  }

  console.log('✅ Tenant encontrado:', tenant.name);

  // Criar planos
  console.log('💳 Criando planos de assinatura...');

  const plansData = [
    {
      slug: 'free',
      name: 'Free',
      description: 'Para começar seu negócio',
      price: 0,
      yearlyPrice: 0,
      limits: {
        maxUsers: 1,
        maxCustomers: 20,
        maxOrders: 10, // por mês
        maxStorage: 500, // MB
      },
      features: {
        customers: true,
        services: true,
        quotations: true,
        orders: true,
        schedule: true,
        basic_financial: true,
        reports_excel: true,
        portal_client: false,
        whatsapp: false,
        email_automation: false,
        nfe: false,
        api: false,
        custom_fields: false,
      },
      sortOrder: 1,
    },
    {
      slug: 'starter',
      name: 'Starter',
      description: 'Para profissionalizar seu atendimento',
      price: 49.90,
      yearlyPrice: 479.00, // 20% OFF
      limits: {
        maxUsers: 3,
        maxCustomers: 100,
        maxOrders: 50,
        maxStorage: 5120, // 5GB
      },
      features: {
        customers: true,
        services: true,
        quotations: true,
        orders: true,
        schedule: true,
        basic_financial: true,
        reports_excel: true,
        portal_client: true,
        whatsapp: true, // até 200/mês
        email_automation: true,
        recurring_contracts: true,
        custom_fields: true,
        reports_pdf: true,
        backup_auto: true,
        nfe: false,
        payment_gateway: false,
        api: false,
      },
      sortOrder: 2,
    },
    {
      slug: 'professional',
      name: 'Professional',
      description: 'Para empresas em crescimento',
      price: 99.90,
      yearlyPrice: 959.00, // 20% OFF
      limits: {
        maxUsers: 10,
        maxCustomers: 500,
        maxOrders: 300,
        maxStorage: 51200, // 50GB
      },
      features: {
        customers: true,
        services: true,
        quotations: true,
        orders: true,
        schedule: true,
        basic_financial: true,
        reports_excel: true,
        portal_client: true,
        whatsapp: true, // ilimitado
        email_automation: true,
        recurring_contracts: true,
        custom_fields: true,
        reports_pdf: true,
        backup_auto: true,
        nfe: true,
        payment_gateway: true,
        inventory: true,
        profitability_reports: true,
        multi_company: true,
        granular_permissions: true,
        online_scheduling: true,
        webhooks: true,
        api_full: false,
        whitelabel: false,
      },
      sortOrder: 3,
    },
    {
      slug: 'enterprise',
      name: 'Enterprise',
      description: 'Para grandes operações',
      price: 299.90,
      yearlyPrice: 2879.00, // 20% OFF
      limits: {
        maxUsers: -1, // ilimitado
        maxCustomers: -1,
        maxOrders: -1,
        maxStorage: 204800, // 200GB
      },
      features: {
        customers: true,
        services: true,
        quotations: true,
        orders: true,
        schedule: true,
        basic_financial: true,
        reports_excel: true,
        portal_client: true,
        whatsapp: true,
        email_automation: true,
        recurring_contracts: true,
        custom_fields: true,
        reports_pdf: true,
        backup_auto: true,
        nfe: true,
        payment_gateway: true,
        inventory: true,
        profitability_reports: true,
        multi_company: true,
        granular_permissions: true,
        online_scheduling: true,
        webhooks: true,
        api_full: true,
        whitelabel: true,
        bi_dashboard: true,
        sla_99_9: true,
        dedicated_support: true,
        onboarding: true,
        training: true,
        priority_roadmap: true,
      },
      sortOrder: 4,
    },
  ];

  const plans = [];
  for (const planData of plansData) {
    let plan = await prisma.plan.findUnique({
      where: { slug: planData.slug },
    });

    if (!plan) {
      plan = await prisma.plan.create({
        data: planData,
      });
      console.log(`✅ Plano criado: ${plan.name} (${plan.slug})`);
    } else {
      console.log(`ℹ️  Plano já existe: ${plan.name}`);
    }
    plans.push(plan);
  }

  // Criar subscription gratuita para o tenant se não existir
  console.log('📅 Verificando assinatura do tenant...');
  let subscription = await prisma.subscription.findUnique({
    where: { tenantId: tenant.id },
  });

  if (!subscription) {
    const freePlan = plans.find(p => p.slug === 'free');
    if (freePlan) {
      const now = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      subscription = await prisma.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: freePlan.id,
          status: 'active',
          billingCycle: 'monthly',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
      console.log(`✅ Assinatura criada: ${freePlan.name}`);
    }
  } else {
    console.log('ℹ️  Tenant já possui assinatura');
  }

  // Criar ou buscar usuário admin
  console.log('👤 Criando usuário admin...');
  const passwordHash = await bcrypt.hash('123456', 10);

  let adminUser = await prisma.user.findFirst({
    where: {
      tenantId: tenant.id,
      email: 'admin@demo.com',
    },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
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
  let techUser = await prisma.user.findFirst({
    where: {
      tenantId: tenant.id,
      email: 'tecnico@demo.com',
    },
  });

  if (!techUser) {
    techUser = await prisma.user.create({
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
      category: 'Manutenção',
      defaultPrice: 150.00,
      unit: 'hora',
      estimatedDuration: 120,
    },
    {
      name: 'Instalação de Equipamento',
      description: 'Instalação e configuração de equipamentos',
      category: 'Instalação',
      defaultPrice: 200.00,
      unit: 'unidade',
      estimatedDuration: 180,
    },
    {
      name: 'Reparo de Emergência',
      description: 'Reparo emergencial com atendimento prioritário',
      category: 'Reparo',
      defaultPrice: 300.00,
      unit: 'hora',
      estimatedDuration: 240,
    },
    {
      name: 'Consultoria Técnica',
      description: 'Consultoria técnica especializada',
      category: 'Consultoria',
      defaultPrice: 250.00,
      unit: 'hora',
      estimatedDuration: 60,
    },
  ];

  const services = [];
  for (const svc of servicesList) {
    let service = await prisma.service.findFirst({
      where: {
        tenantId: tenant.id,
        name: svc.name,
      },
    });

    if (!service) {
      service = await prisma.service.create({
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

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\n📊 Credenciais de acesso:');
  console.log('  👤 Admin: admin@demo.com / 123456');
  console.log('  👷 Técnico: tecnico@demo.com / 123456');
  console.log(`\n🏢 Tenant ID: ${tenant.id}`);
  console.log(`📦 Tenant: ${tenant.slug}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
