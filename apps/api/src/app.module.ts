import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

// Core modules
import { TenantModule } from './core/tenant';
import { DatabaseModule } from './core/database';
import { AuthModule } from './core/auth';

// Business modules
import { CustomersModule } from './modules/customers';

// Middleware
import { TenantMiddleware } from './common/middleware';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
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
