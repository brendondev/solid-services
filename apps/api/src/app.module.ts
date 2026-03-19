import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { RolesGuard, JwtAuthGuard } from '@core/auth';

// SECURITY: TEMPORÁRIO - Permitir seed em produção para setup inicial
// TODO: Remover após primeiro seed
import { SeedController } from './seed.controller';

// Core modules
import { TenantModule } from './core/tenant';
import { DatabaseModule } from './core/database';
import { AuthModule } from './core/auth';
import { StorageModule } from './core/storage';

// Business modules
import { CustomersModule } from './modules/customers';
import { ServicesModule } from './modules/services';
import { QuotationsModule } from './modules/quotations';
import { ServiceOrdersModule } from './modules/service-orders';
import { FinancialModule } from './modules/financial';
import { SuppliersModule } from './modules/suppliers';
import { DashboardModule } from './modules/dashboard';
import { SchedulingModule } from './modules/scheduling';
import { CustomerPortalModule } from './modules/customer-portal';
import { NotificationsModule } from './modules/notifications';
import { AuditModule } from './modules/audit';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

// Middleware & Interceptors
import { TenantMiddleware } from './common/middleware';
import { TenantContextInterceptor } from './common/interceptors';

@Module({
  controllers: [AppController, SeedController],
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
    StorageModule,

    // Business modules
    CustomersModule,
    ServicesModule,
    QuotationsModule,
    ServiceOrdersModule,
    FinancialModule,
    SuppliersModule,
    DashboardModule,
    SchedulingModule,
    CustomerPortalModule,
    NotificationsModule,
    AuditModule,
    SubscriptionsModule,
  ],
  providers: [
    // ORDEM CRÍTICA:
    // 1. JwtAuthGuard valida token e popula req.user
    // 2. RolesGuard verifica permissões de req.user
    // 3. ThrottlerGuard aplica rate limiting
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // TenantContextInterceptor garante que toda execução aconteça
    // dentro do contexto AsyncLocal do tenant
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
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
