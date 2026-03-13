import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Testes E2E - Workflow Completo: Quotation → Aprovação → Service Order
 *
 * Fluxo testado:
 * 1. Criar cliente
 * 2. Criar serviço
 * 3. Criar orçamento (draft)
 * 4. Enviar orçamento para cliente (sent)
 * 5. Aprovar orçamento (approved)
 * 6. Criar ordem de serviço a partir do orçamento
 * 7. Atualizar status da ordem (scheduled → in_progress → completed)
 */
describe('Quotations Workflow (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let customerId: string;
  let serviceId: string;
  let quotationId: string;
  let serviceOrderId: string;

  const testTenant = {
    tenantSlug: `test-workflow-${Date.now()}`,
    tenantName: 'Test Workflow Tenant',
    adminName: 'Admin User',
    adminEmail: `admin-workflow-${Date.now()}@test.com`,
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Setup: Criar dados necessários', () => {
    it('deve criar cliente', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Cliente Workflow Test',
          type: 'individual',
          status: 'active',
          contacts: [
            {
              name: 'Cliente Teste',
              email: 'cliente@test.com',
              phone: '11987654321',
              isPrimary: true,
            },
          ],
        })
        .expect(201);

      customerId = response.body.id;
    });

    it('deve criar serviço', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Instalação de Sistema',
          description: 'Instalação completa de sistema',
          category: 'Instalação',
          unitPrice: 500.00,
          unit: 'serviço',
          status: 'active',
        })
        .expect(201);

      serviceId = response.body.id;
    });
  });

  describe('Fluxo de Orçamento', () => {
    it('deve criar orçamento em modo draft', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/quotations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          customerId,
          status: 'draft',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
          notes: 'Orçamento para instalação de sistema',
          items: [
            {
              serviceId,
              quantity: 1,
              unitPrice: 500.00,
              discount: 0,
            },
          ],
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('number');
      expect(response.body.status).toBe('draft');
      expect(response.body.customerId).toBe(customerId);
      expect(response.body.items).toHaveLength(1);
      expect(Number(response.body.totalAmount)).toBe(500.00);

      quotationId = response.body.id;
    });

    it('deve atualizar status do orçamento para "sent"', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/quotations/${quotationId}/status/sent`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('sent');
    });

    it('deve aprovar orçamento', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/quotations/${quotationId}/status/approved`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('approved');
    });

    it('deve listar orçamentos por cliente', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/quotations/customer/${customerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].id).toBe(quotationId);
    });
  });

  describe('Fluxo de Ordem de Serviço', () => {
    it('deve criar ordem a partir de orçamento aprovado', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/service-orders/from-quotation/${quotationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('number');
      expect(response.body.quotationId).toBe(quotationId);
      expect(response.body.customerId).toBe(customerId);
      expect(response.body.status).toBe('open');
      expect(response.body.items).toHaveLength(1);

      serviceOrderId = response.body.id;
    });

    it('não deve permitir criar ordem duplicada do mesmo orçamento', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/service-orders/from-quotation/${quotationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('deve atualizar status para "scheduled"', async () => {
      const scheduledDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/service-orders/${serviceOrderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          status: 'scheduled',
          scheduledFor: scheduledDate.toISOString(),
        })
        .expect(200);

      expect(response.body.status).toBe('scheduled');
      expect(response.body.scheduledFor).toBeTruthy();
    });

    it('deve adicionar evento na timeline', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/service-orders/${serviceOrderId}/timeline`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          event: 'custom_event',
          description: 'Cliente confirmou agendamento por telefone',
        })
        .expect(201);

      expect(response.body).toHaveProperty('timeline');
      const timeline = response.body.timeline;
      expect(timeline.length).toBeGreaterThan(0);
    });

    it('deve atualizar status para "in_progress"', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/service-orders/${serviceOrderId}/status/in_progress`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          description: 'Técnico iniciou o trabalho',
        })
        .expect(200);

      expect(response.body.status).toBe('in_progress');
    });

    it('deve concluir ordem de serviço', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/service-orders/${serviceOrderId}/status/completed`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          description: 'Instalação concluída com sucesso',
        })
        .expect(200);

      expect(response.body.status).toBe('completed');
      expect(response.body.completedAt).toBeTruthy();
    });

    it('deve buscar ordem completa por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/service-orders/${serviceOrderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(serviceOrderId);
      expect(response.body.status).toBe('completed');
      expect(response.body).toHaveProperty('customer');
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('timeline');
      expect(response.body).toHaveProperty('checklists');
    });
  });

  describe('Validações de Workflow', () => {
    it('não deve permitir criar ordem de orçamento não aprovado', async () => {
      // Criar novo orçamento em draft
      const draftQuotation = await request(app.getHttpServer())
        .post('/api/v1/quotations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          customerId,
          status: 'draft',
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

      // Tentar criar ordem sem aprovar
      await request(app.getHttpServer())
        .post(`/api/v1/service-orders/from-quotation/${draftQuotation.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('deve listar orçamentos pendentes', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/quotations/pending')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Deve ter pelo menos o orçamento draft criado acima
      const hasDraftOrSent = response.body.some(
        (q: any) => q.status === 'draft' || q.status === 'sent'
      );
      expect(hasDraftOrSent).toBe(true);
    });

    it('deve filtrar ordens por status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/service-orders?status=completed')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      response.body.data.forEach((order: any) => {
        expect(order.status).toBe('completed');
      });
    });
  });

  describe('Geração de PDF', () => {
    it('deve gerar PDF do orçamento', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/quotations/${quotationId}/pdf`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.body).toBeDefined();
    });
  });
});
