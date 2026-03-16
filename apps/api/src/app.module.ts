import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { SeedController } from './seed.controller';
import { RolesGuard } from '@core/auth';

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
import { DashboardModule } from './modules/dashboard';
import { SchedulingModule } from './modules/scheduling';
import { CustomerPortalModule } from './modules/customer-portal';
import { NotificationsModule } from './modules/notifications';
import { AuditModule } from './modules/audit';

// Middleware
import { TenantMiddleware } from './common/middleware';

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
    DashboardModule,
    SchedulingModule,
    CustomerPortalModule,
    NotificationsModule,
    AuditModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
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
