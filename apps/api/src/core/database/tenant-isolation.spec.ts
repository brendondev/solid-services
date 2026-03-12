import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { TenantContextService } from '../tenant';
import { ConfigModule } from '@nestjs/config';

/**
 * Testes de isolamento de tenant
 *
 * ESTES TESTES SÃO CRÍTICOS PARA SEGURANÇA!
 * Eles garantem que dados de um tenant não vazam para outro.
 *
 * Executar sempre que modificar:
 * - PrismaService
 * - TenantContextService
 * - Modelos do Prisma
 */
describe('Tenant Isolation', () => {
  let prisma: PrismaService;
  let tenantContext: TenantContextService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [PrismaService, TenantContextService],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    tenantContext = module.get<TenantContextService>(TenantContextService);

    // Conectar ao banco
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  describe('Customer Isolation', () => {
    let tenant1Id: string;
    let tenant2Id: string;
    let customer1Id: string;
    let customer2Id: string;

    beforeAll(async () => {
      // Criar tenants para teste (sem contexto)
      const tenant1 = await prisma.tenant.create({
        data: {
          slug: 'test-tenant-1',
          name: 'Test Tenant 1',
          status: 'active',
        },
      });
      tenant1Id = tenant1.id;

      const tenant2 = await prisma.tenant.create({
        data: {
          slug: 'test-tenant-2',
          name: 'Test Tenant 2',
          status: 'active',
        },
      });
      tenant2Id = tenant2.id;
    });

    afterAll(async () => {
      // Limpar dados de teste
      await prisma.customer.deleteMany({
        where: {
          OR: [{ tenantId: tenant1Id }, { tenantId: tenant2Id }],
        },
      });

      await prisma.tenant.deleteMany({
        where: {
          OR: [{ id: tenant1Id }, { id: tenant2Id }],
        },
      });
    });

    it('should create customer in tenant 1 context', async () => {
      await tenantContext.run({ tenantId: tenant1Id }, async () => {
        const customer = await prisma.customer.create({
          data: {
            name: 'Customer from Tenant 1',
            type: 'individual',
            status: 'active',
          },
        });

        expect(customer.tenantId).toBe(tenant1Id);
        customer1Id = customer.id;
      });
    });

    it('should create customer in tenant 2 context', async () => {
      await tenantContext.run({ tenantId: tenant2Id }, async () => {
        const customer = await prisma.customer.create({
          data: {
            name: 'Customer from Tenant 2',
            type: 'individual',
            status: 'active',
          },
        });

        expect(customer.tenantId).toBe(tenant2Id);
        customer2Id = customer.id;
      });
    });

    it('should only find customers from tenant 1 when in tenant 1 context', async () => {
      await tenantContext.run({ tenantId: tenant1Id }, async () => {
        const customers = await prisma.customer.findMany();

        expect(customers.length).toBeGreaterThan(0);
        customers.forEach((customer) => {
          expect(customer.tenantId).toBe(tenant1Id);
        });
      });
    });

    it('should only find customers from tenant 2 when in tenant 2 context', async () => {
      await tenantContext.run({ tenantId: tenant2Id }, async () => {
        const customers = await prisma.customer.findMany();

        expect(customers.length).toBeGreaterThan(0);
        customers.forEach((customer) => {
          expect(customer.tenantId).toBe(tenant2Id);
        });
      });
    });

    it('should NOT find tenant 1 customer when in tenant 2 context', async () => {
      await tenantContext.run({ tenantId: tenant2Id }, async () => {
        const customer = await prisma.customer.findUnique({
          where: { id: customer1Id },
        });

        expect(customer).toBeNull();
      });
    });

    it('should NOT find tenant 2 customer when in tenant 1 context', async () => {
      await tenantContext.run({ tenantId: tenant1Id }, async () => {
        const customer = await prisma.customer.findUnique({
          where: { id: customer2Id },
        });

        expect(customer).toBeNull();
      });
    });

    it('should NOT update customer from another tenant', async () => {
      await tenantContext.run({ tenantId: tenant2Id }, async () => {
        // Tentar atualizar customer do tenant 1 no contexto do tenant 2
        const result = await prisma.customer.updateMany({
          where: { id: customer1Id },
          data: { name: 'Hacked Name' },
        });

        // Nenhum registro deve ser atualizado
        expect(result.count).toBe(0);
      });

      // Verificar que o customer não foi alterado
      await tenantContext.run({ tenantId: tenant1Id }, async () => {
        const customer = await prisma.customer.findUnique({
          where: { id: customer1Id },
        });

        expect(customer?.name).toBe('Customer from Tenant 1');
      });
    });

    it('should NOT delete customer from another tenant', async () => {
      await tenantContext.run({ tenantId: tenant2Id }, async () => {
        // Tentar deletar customer do tenant 1 no contexto do tenant 2
        const result = await prisma.customer.deleteMany({
          where: { id: customer1Id },
        });

        // Nenhum registro deve ser deletado
        expect(result.count).toBe(0);
      });

      // Verificar que o customer ainda existe
      await tenantContext.run({ tenantId: tenant1Id }, async () => {
        const customer = await prisma.customer.findUnique({
          where: { id: customer1Id },
        });

        expect(customer).not.toBeNull();
      });
    });
  });

  describe('Context Isolation', () => {
    it('should isolate contexts between concurrent requests', async () => {
      const tenant1 = await prisma.tenant.create({
        data: { slug: 'concurrent-1', name: 'Concurrent 1', status: 'active' },
      });

      const tenant2 = await prisma.tenant.create({
        data: { slug: 'concurrent-2', name: 'Concurrent 2', status: 'active' },
      });

      // Simular requisições concorrentes
      const [result1, result2] = await Promise.all([
        tenantContext.run({ tenantId: tenant1.id }, async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return tenantContext.getTenantId();
        }),
        tenantContext.run({ tenantId: tenant2.id }, async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return tenantContext.getTenantId();
        }),
      ]);

      expect(result1).toBe(tenant1.id);
      expect(result2).toBe(tenant2.id);
      expect(result1).not.toBe(result2);

      // Cleanup
      await prisma.tenant.deleteMany({
        where: { OR: [{ id: tenant1.id }, { id: tenant2.id }] },
      });
    });
  });
});
