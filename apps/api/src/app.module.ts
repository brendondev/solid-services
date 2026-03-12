import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';

// Core modules
import { TenantModule } from './core/tenant';
import { DatabaseModule } from './core/database';
import { AuthModule } from './core/auth';

// Business modules
import { CustomersModule } from './modules/customers';
import { ServicesModule } from './modules/services';
import { QuotationsModule } from './modules/quotations';
import { ServiceOrdersModule } from './modules/service-orders';

// Middleware
import { TenantMiddleware } from './common/middleware';

@Module({
  controllers: [AppController],
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: '.env',
    }),

    // Rate limiting (100 requests per minute per tenant)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Core modules
    TenantModule,
    DatabaseModule,
    AuthModule,

    // Business modules
    CustomersModule,
    ServicesModule,
    QuotationsModule,
    ServiceOrdersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplicar TenantMiddleware em todas as rotas
    // Exceto rotas públicas (health check, etc)
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
