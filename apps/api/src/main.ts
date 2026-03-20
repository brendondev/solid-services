import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

  // Compression - comprime respostas HTTP (gzip)
  app.use(compression());

  // CORS - SECURITY: Whitelist específica
  const allowedOrigins = [
    'https://solid-services-api.vercel.app',
    process.env.WEB_URL,
    'http://localhost:3001',
    'http://localhost:3000',
  ].filter(Boolean) as string[];

  // Adicionar origens adicionais da variável de ambiente (separadas por vírgula)
  if (process.env.CORS_ALLOWED_ORIGINS) {
    const additionalOrigins = process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim());
    allowedOrigins.push(...additionalOrigins);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sem origin (ex: mobile apps, Postman)
      if (!origin) {
        return callback(null, true);
      }

      // Verificar se a origem está na whitelist
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Em desenvolvimento, ser mais permissivo (mas logar)
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[CORS] Origin not in whitelist (allowed in dev): ${origin}`);
        return callback(null, true);
      }

      // Em produção, bloquear silenciosamente (sem lançar erro)
      console.error(`[SECURITY] CORS blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Customer-Token', 'X-Document-Digits'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: '', method: RequestMethod.GET },
      { path: 'health', method: RequestMethod.GET },
    ],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Solid Service API')
    .setDescription('ERP SaaS Multi-tenant API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT || process.env.API_PORT || 3000);
  await app.listen(port);

  // SECURITY: Logs apenas em desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    console.log(`API running on port ${port}`);
    console.log(`API docs path: /api/docs`);
  }
}

bootstrap();
