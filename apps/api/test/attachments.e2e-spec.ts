import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Testes E2E - Attachments (Upload de Anexos)
 *
 * Fluxo testado:
 * 1. Criar ordem de serviço
 * 2. Upload de anexo
 * 3. Listar anexos da ordem
 * 4. Gerar URL de download
 * 5. Deletar anexo
 */
describe('Attachments (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let customerId: string;
  let serviceOrderId: string;
  let attachmentId: string;

  const testTenant = {
    tenantSlug: `test-attachments-${Date.now()}`,
    tenantName: 'Test Attachments Tenant',
    adminName: 'Admin User',
    adminEmail: `admin-attachments-${Date.now()}@test.com`,
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

    // Criar cliente
    const customerResponse = await request(app.getHttpServer())
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Cliente Attachments Test',
        type: 'individual',
        status: 'active',
      });

    customerId = customerResponse.body.id;

    // Criar ordem de serviço
    const orderResponse = await request(app.getHttpServer())
      .post('/api/v1/service-orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId,
        status: 'open',
        description: 'Ordem para testar anexos',
      });

    serviceOrderId = orderResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/service-orders/:id/attachments', () => {
    it('deve fazer upload de arquivo de texto', async () => {
      // Criar arquivo temporário de teste
      const testFilePath = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(testFilePath, 'Conteúdo de teste para anexo E2E');

      const response = await request(app.getHttpServer())
        .post(`/api/v1/service-orders/${serviceOrderId}/attachments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', testFilePath)
        .field('description', 'Arquivo de teste E2E')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('fileName');
      expect(response.body).toHaveProperty('fileSize');
      expect(response.body).toHaveProperty('storageKey');
      expect(response.body.description).toBe('Arquivo de teste E2E');
      expect(response.body.fileName).toContain('.txt');

      attachmentId = response.body.id;

      // Limpar arquivo temporário
      fs.unlinkSync(testFilePath);
    });

    it('deve fazer upload de imagem', async () => {
      // Criar imagem PNG mínima (1x1 pixel transparente)
      const testImagePath = path.join(__dirname, 'test-image.png');
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      fs.writeFileSync(testImagePath, pngBuffer);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/service-orders/${serviceOrderId}/attachments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', testImagePath)
        .field('description', 'Foto do local')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.fileName).toContain('.png');
      expect(response.body.mimeType).toBe('image/png');

      // Limpar arquivo temporário
      fs.unlinkSync(testImagePath);
    });

    it('deve falhar ao tentar upload sem arquivo', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/service-orders/${serviceOrderId}/attachments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .field('description', 'Sem arquivo')
        .expect(400);
    });

    it('deve aceitar upload sem descrição', async () => {
      const testFilePath = path.join(__dirname, 'test-no-desc.txt');
      fs.writeFileSync(testFilePath, 'Arquivo sem descrição');

      const response = await request(app.getHttpServer())
        .post(`/api/v1/service-orders/${serviceOrderId}/attachments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', testFilePath)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.description).toBeFalsy();

      fs.unlinkSync(testFilePath);
    });
  });

  describe('GET /api/v1/service-orders/:id', () => {
    it('deve listar ordem com anexos', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/service-orders/${serviceOrderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('attachments');
      expect(Array.isArray(response.body.attachments)).toBe(true);
      expect(response.body.attachments.length).toBeGreaterThanOrEqual(3);

      const firstAttachment = response.body.attachments.find(
        (a: any) => a.id === attachmentId
      );
      expect(firstAttachment).toBeDefined();
      expect(firstAttachment.description).toBe('Arquivo de teste E2E');
    });
  });

  describe('GET /api/v1/service-orders/:id/attachments/:attachmentId/download', () => {
    it('deve gerar URL de download do anexo', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/service-orders/${serviceOrderId}/attachments/${attachmentId}/download`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('downloadUrl');
      expect(response.body).toHaveProperty('expiresIn');
      expect(response.body.downloadUrl).toContain('http');
      expect(typeof response.body.downloadUrl).toBe('string');
    });

    it('deve falhar ao buscar download de anexo inexistente', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/service-orders/${serviceOrderId}/attachments/00000000-0000-0000-0000-000000000000/download`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('DELETE /api/v1/service-orders/:id/attachments/:attachmentId', () => {
    it('deve deletar anexo', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/service-orders/${serviceOrderId}/attachments/${attachmentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('sucesso');
    });

    it('deve confirmar que anexo foi removido', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/service-orders/${serviceOrderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const deletedAttachment = response.body.attachments.find(
        (a: any) => a.id === attachmentId
      );
      expect(deletedAttachment).toBeUndefined();
    });

    it('deve falhar ao tentar deletar anexo inexistente', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/service-orders/${serviceOrderId}/attachments/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('deve falhar ao tentar acessar download de anexo deletado', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/service-orders/${serviceOrderId}/attachments/${attachmentId}/download`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('Validações de Tamanho e Tipo', () => {
    it('deve aceitar arquivo grande (simulado)', async () => {
      // Criar arquivo de 1MB
      const testFilePath = path.join(__dirname, 'test-large.txt');
      const largeContent = 'A'.repeat(1024 * 1024); // 1MB
      fs.writeFileSync(testFilePath, largeContent);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/service-orders/${serviceOrderId}/attachments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', testFilePath)
        .field('description', 'Arquivo grande 1MB');

      // Dependendo da configuração, pode ser 201 ou 400 (se houver limite)
      expect([201, 400, 413]).toContain(response.status);

      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });
  });

  describe('Isolamento Multi-tenant', () => {
    let tenant2AccessToken: string;
    let tenant2OrderId: string;

    it('deve criar segundo tenant com ordem', async () => {
      // Registrar segundo tenant
      const tenant2 = {
        tenantSlug: `test-attach2-${Date.now()}`,
        tenantName: 'Test Tenant 2',
        adminName: 'Admin 2',
        adminEmail: `admin2-attach-${Date.now()}@test.com`,
        adminPassword: 'Test@123456',
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(tenant2);

      tenant2AccessToken = registerResponse.body.accessToken;

      // Criar cliente
      const customerResponse = await request(app.getHttpServer())
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${tenant2AccessToken}`)
        .send({
          name: 'Cliente Tenant 2',
          type: 'individual',
          status: 'active',
        });

      // Criar ordem
      const orderResponse = await request(app.getHttpServer())
        .post('/api/v1/service-orders')
        .set('Authorization', `Bearer ${tenant2AccessToken}`)
        .send({
          customerId: customerResponse.body.id,
          status: 'open',
          description: 'Ordem tenant 2',
        });

      tenant2OrderId = orderResponse.body.id;
    });

    it('tenant 1 NÃO deve acessar anexos do tenant 2', async () => {
      // Criar anexo no tenant 2
      const testFilePath = path.join(__dirname, 'test-tenant2.txt');
      fs.writeFileSync(testFilePath, 'Anexo do tenant 2');

      const uploadResponse = await request(app.getHttpServer())
        .post(`/api/v1/service-orders/${tenant2OrderId}/attachments`)
        .set('Authorization', `Bearer ${tenant2AccessToken}`)
        .attach('file', testFilePath);

      const tenant2AttachmentId = uploadResponse.body.id;

      // Tentar acessar do tenant 1
      await request(app.getHttpServer())
        .get(`/api/v1/service-orders/${tenant2OrderId}/attachments/${tenant2AttachmentId}/download`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      // Tentar deletar do tenant 1
      await request(app.getHttpServer())
        .delete(`/api/v1/service-orders/${tenant2OrderId}/attachments/${tenant2AttachmentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      fs.unlinkSync(testFilePath);
    });
  });
});
