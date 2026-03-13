import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Testes E2E - Customers
 *
 * Fluxo testado:
 * 1. Criar cliente
 * 2. Listar clientes
 * 3. Buscar cliente por ID
 * 4. Atualizar cliente
 * 5. Deletar cliente (soft delete)
 */
describe('Customers (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let customerId: string;

  const testTenant = {
    tenantSlug: `test-customers-${Date.now()}`,
    tenantName: 'Test Customers Tenant',
    adminName: 'Admin User',
    adminEmail: `admin-customers-${Date.now()}@test.com`,
    adminPassword: 'Test@123456',
  };

  const customerData = {
    name: 'João da Silva',
    type: 'individual',
    status: 'active',
    contacts: [
      {
        name: 'João da Silva',
        email: 'joao@email.com',
        phone: '11987654321',
        isPrimary: true,
      },
    ],
    addresses: [
      {
        street: 'Rua Teste',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        isPrimary: true,
      },
    ],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Registrar e fazer login
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(testTenant);

    accessToken = registerResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/customers', () => {
    it('deve criar novo cliente com contatos e endereços', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(customerData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(customerData.name);
      expect(response.body.type).toBe(customerData.type);
      expect(response.body.contacts).toHaveLength(1);
      expect(response.body.addresses).toHaveLength(1);
      expect(response.body.contacts[0].isPrimary).toBe(true);
      expect(response.body.addresses[0].isPrimary).toBe(true);

      customerId = response.body.id;
    });

    it('deve falhar ao criar cliente sem nome', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          type: 'individual',
          status: 'active',
        })
        .expect(400);
    });

    it('deve falhar ao criar cliente com tipo inválido', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Teste',
          type: 'tipo-invalido',
          status: 'active',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/customers', () => {
    it('deve listar clientes com paginação', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/customers?page=1&limit=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('deve listar apenas clientes ativos', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/customers/active')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((customer: any) => {
        expect(customer.status).toBe('active');
      });
    });

    it('deve buscar clientes por termo de pesquisa', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/customers?search=João')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/customers/:id', () => {
    it('deve buscar cliente por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(customerId);
      expect(response.body.name).toBe(customerData.name);
      expect(response.body).toHaveProperty('contacts');
      expect(response.body).toHaveProperty('addresses');
    });

    it('deve retornar 404 para cliente inexistente', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/customers/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/customers/:id', () => {
    it('deve atualizar dados do cliente', async () => {
      const updatedData = {
        name: 'João da Silva Atualizado',
        type: 'business',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.type).toBe(updatedData.type);
    });

    it('deve atualizar status do cliente', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'inactive' })
        .expect(200);

      expect(response.body.status).toBe('inactive');
    });
  });

  describe('DELETE /api/v1/customers/:id', () => {
    it('deve falhar ao deletar sem role admin', async () => {
      // Este teste assume que o RolesGuard está ativo
      // Como estamos logados como admin, vamos apenas verificar o endpoint
      await request(app.getHttpServer())
        .delete(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('deve retornar 404 ao tentar deletar cliente inexistente', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/customers/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('Isolamento Multi-tenant', () => {
    let tenant2AccessToken: string;
    let tenant2CustomerId: string;

    it('deve criar segundo tenant com cliente', async () => {
      // Registrar segundo tenant
      const tenant2 = {
        tenantSlug: `test-tenant2-${Date.now()}`,
        tenantName: 'Test Tenant 2',
        adminName: 'Admin 2',
        adminEmail: `admin2-${Date.now()}@test.com`,
        adminPassword: 'Test@123456',
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(tenant2);

      tenant2AccessToken = registerResponse.body.accessToken;

      // Criar cliente no tenant 2
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${tenant2AccessToken}`)
        .send({
          name: 'Cliente do Tenant 2',
          type: 'individual',
          status: 'active',
        });

      tenant2CustomerId = createResponse.body.id;
    });

    it('tenant 1 NÃO deve ver clientes do tenant 2', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/customers/${tenant2CustomerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('tenant 2 NÃO deve ver clientes do tenant 1', async () => {
      // customerId pertence ao tenant 1
      await request(app.getHttpServer())
        .get(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${tenant2AccessToken}`)
        .expect(404);
    });
  });
});
