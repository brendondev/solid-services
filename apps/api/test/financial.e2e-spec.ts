import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Testes E2E - Financial
 *
 * Fluxo testado:
 * 1. Criar recebível manualmente
 * 2. Registrar pagamento parcial
 * 3. Registrar pagamento final
 * 4. Validar status automático
 * 5. Dashboard financeiro
 */
describe('Financial (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let customerId: string;
  let receivableId: string;

  const testTenant = {
    tenantSlug: `test-financial-${Date.now()}`,
    tenantName: 'Test Financial Tenant',
    adminName: 'Admin User',
    adminEmail: `admin-financial-${Date.now()}@test.com`,
    adminPassword: 'Test@123456',
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

    // Criar cliente para os testes
    const customerResponse = await request(app.getHttpServer())
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Cliente Financial Test',
        type: 'individual',
        status: 'active',
      });

    customerId = customerResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/financial/receivables', () => {
    it('deve criar recebível manualmente', async () => {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

      const response = await request(app.getHttpServer())
        .post('/api/v1/financial/receivables')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          customerId,
          description: 'Serviço de instalação',
          amount: 1000.00,
          dueDate: dueDate.toISOString(),
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.customerId).toBe(customerId);
      expect(Number(response.body.amount)).toBe(1000.00);
      expect(Number(response.body.paidAmount)).toBe(0);
      expect(response.body.status).toBe('pending');

      receivableId = response.body.id;
    });

    it('deve falhar ao criar recebível sem valor', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/financial/receivables')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          customerId,
          description: 'Teste',
          dueDate: new Date().toISOString(),
        })
        .expect(400);
    });

    it('deve falhar ao criar recebível sem cliente', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/financial/receivables')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          description: 'Teste',
          amount: 100.00,
          dueDate: new Date().toISOString(),
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/financial/receivables/:id/payments', () => {
    it('deve registrar pagamento parcial', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/financial/receivables/${receivableId}/payments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 400.00,
          method: 'pix',
          paidAt: new Date().toISOString(),
        })
        .expect(201);

      expect(response.body).toHaveProperty('payment');
      expect(response.body).toHaveProperty('receivable');
      expect(Number(response.body.payment.amount)).toBe(400.00);
      expect(response.body.payment.method).toBe('pix');
      expect(Number(response.body.receivable.paidAmount)).toBe(400.00);
      expect(response.body.receivable.status).toBe('partial');
    });

    it('deve registrar segundo pagamento parcial', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/financial/receivables/${receivableId}/payments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 300.00,
          method: 'credit_card',
          paidAt: new Date().toISOString(),
        })
        .expect(201);

      expect(Number(response.body.receivable.paidAmount)).toBe(700.00);
      expect(response.body.receivable.status).toBe('partial');
    });

    it('deve registrar pagamento final e marcar como pago', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/financial/receivables/${receivableId}/payments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 300.00,
          method: 'cash',
          paidAt: new Date().toISOString(),
        })
        .expect(201);

      expect(Number(response.body.receivable.paidAmount)).toBe(1000.00);
      expect(response.body.receivable.status).toBe('paid');
    });

    it('deve falhar ao tentar pagar valor excedente', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/financial/receivables/${receivableId}/payments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 100.00,
          method: 'pix',
          paidAt: new Date().toISOString(),
        })
        .expect(400);
    });

    it('deve falhar com método de pagamento inválido', async () => {
      // Criar novo recebível
      const newReceivable = await request(app.getHttpServer())
        .post('/api/v1/financial/receivables')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          customerId,
          description: 'Teste',
          amount: 100.00,
          dueDate: new Date().toISOString(),
        });

      await request(app.getHttpServer())
        .post(`/api/v1/financial/receivables/${newReceivable.body.id}/payments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 50.00,
          method: 'metodo_invalido',
          paidAt: new Date().toISOString(),
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/financial/receivables', () => {
    it('deve listar recebíveis com paginação', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/financial/receivables?page=1&limit=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('deve filtrar recebíveis por status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/financial/receivables?status=paid')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((receivable: any) => {
        expect(receivable.status).toBe('paid');
      });
    });

    it('deve buscar recebíveis por cliente', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/financial/receivables/customer/${customerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((receivable: any) => {
        expect(receivable.customerId).toBe(customerId);
      });
    });
  });

  describe('GET /api/v1/financial/receivables/:id', () => {
    it('deve buscar recebível por ID com pagamentos', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/financial/receivables/${receivableId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(receivableId);
      expect(response.body).toHaveProperty('payments');
      expect(response.body.payments.length).toBe(3); // 3 pagamentos registrados
      expect(Number(response.body.paidAmount)).toBe(1000.00);
      expect(response.body.status).toBe('paid');
    });

    it('deve retornar 404 para recebível inexistente', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/financial/receivables/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/financial/dashboard', () => {
    it('deve retornar dashboard financeiro com métricas', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/financial/dashboard')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary).toHaveProperty('totalReceivables');
      expect(response.body.summary).toHaveProperty('totalPaid');
      expect(response.body.summary).toHaveProperty('totalPending');
      expect(response.body.summary).toHaveProperty('totalOverdue');

      expect(response.body).toHaveProperty('byStatus');
      expect(Array.isArray(response.body.byStatus)).toBe(true);

      expect(response.body).toHaveProperty('recentReceivables');
      expect(Array.isArray(response.body.recentReceivables)).toBe(true);
    });
  });

  describe('Fluxo Recebível de Ordem', () => {
    let serviceId: string;
    let quotationId: string;
    let orderId: string;
    let orderReceivableId: string;

    it('deve criar ordem completada para gerar recebível', async () => {
      // Criar serviço
      const serviceResponse = await request(app.getHttpServer())
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Serviço de Teste',
          category: 'Instalação',
          unitPrice: 500.00,
          unit: 'serviço',
          status: 'active',
        });
      serviceId = serviceResponse.body.id;

      // Criar orçamento
      const quotationResponse = await request(app.getHttpServer())
        .post('/api/v1/quotations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          customerId,
          status: 'approved',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              serviceId,
              quantity: 1,
              unitPrice: 500.00,
              discount: 0,
            },
          ],
        });
      quotationId = quotationResponse.body.id;

      // Criar ordem
      const orderResponse = await request(app.getHttpServer())
        .post(`/api/v1/service-orders/from-quotation/${quotationId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      orderId = orderResponse.body.id;

      // Completar ordem
      await request(app.getHttpServer())
        .patch(`/api/v1/service-orders/${orderId}/status/completed`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ description: 'Concluído' });
    });

    it('deve criar recebível a partir de ordem completada', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/financial/receivables/from-order/${orderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.orderId).toBe(orderId);
      expect(response.body.customerId).toBe(customerId);
      expect(Number(response.body.amount)).toBe(500.00);
      expect(response.body.status).toBe('pending');

      orderReceivableId = response.body.id;
    });

    it('não deve permitir criar recebível duplicado da mesma ordem', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/financial/receivables/from-order/${orderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  describe('PATCH /api/v1/financial/receivables/:id', () => {
    it('deve atualizar dados do recebível', async () => {
      const newDueDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 dias

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/financial/receivables/${receivableId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          dueDate: newDueDate.toISOString(),
          description: 'Descrição atualizada',
        })
        .expect(200);

      expect(response.body.description).toBe('Descrição atualizada');
    });
  });
});
