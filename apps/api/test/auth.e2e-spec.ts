import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Testes E2E - Autenticação
 *
 * Fluxo testado:
 * 1. Registro de novo tenant + admin
 * 2. Login com credenciais
 * 3. Refresh token
 * 4. Validação de token inválido
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  const testTenant = {
    tenantSlug: `test-tenant-${Date.now()}`,
    tenantName: 'Test Tenant E2E',
    adminName: 'Admin User',
    adminEmail: `admin-${Date.now()}@test.com`,
    adminPassword: 'Test@123456',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Aplicar mesmas configurações do main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/auth/register (POST)', () => {
    it('deve criar novo tenant e usuário admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testTenant)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testTenant.adminEmail);
      expect(response.body.user.roles).toContain('admin');

      // Salvar tokens para próximos testes
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('deve falhar ao tentar criar tenant com slug duplicado', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testTenant)
        .expect(400);
    });

    it('deve falhar com senha fraca', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...testTenant,
          tenantSlug: `test-weak-${Date.now()}`,
          adminPassword: '123', // Senha muito curta
        })
        .expect(400);
    });

    it('deve falhar com email inválido', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...testTenant,
          tenantSlug: `test-invalid-${Date.now()}`,
          adminEmail: 'email-invalido', // Sem @
        })
        .expect(400);
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testTenant.adminEmail,
          password: testTenant.adminPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(testTenant.adminEmail);

      // Atualizar tokens
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('deve falhar com email inexistente', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'naoexiste@test.com',
          password: 'qualquersenha',
        })
        .expect(401);
    });

    it('deve falhar com senha incorreta', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testTenant.adminEmail,
          password: 'SenhaErrada123',
        })
        .expect(401);
    });
  });

  describe('/api/v1/auth/refresh (POST)', () => {
    it('deve renovar access token com refresh token válido', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('deve falhar com refresh token inválido', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'token.invalido.fake',
        })
        .expect(401);
    });
  });

  describe('Autenticação em endpoints protegidos', () => {
    it('deve acessar endpoint protegido com token válido', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('deve falhar ao acessar endpoint sem token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/customers')
        .expect(401);
    });

    it('deve falhar com token inválido', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/customers')
        .set('Authorization', 'Bearer token.invalido.fake')
        .expect(401);
    });
  });
});
