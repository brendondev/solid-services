import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { RolesGuard, JwtAuthGuard } from '@core/auth';

// SECURITY: Controllers de desenvolvimento apenas em ambiente não-produção
const devControllers: any[] = [];
if (process.env.NODE_ENV !== 'production') {
  try {
    const { SeedController } = require('./seed.controller');
    const { DebugController } = require('./debug.controller');
    devControllers.push(SeedController, DebugController);
    console.log('[SECURITY] Dev controllers loaded (non-production environment)');
  } catch (e) {
    console.error('[ERROR] Failed to load dev controllers:', e);
  }
}

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
import { UsersModule } from './modules/users/users.module';
import { DigitalSignatureModule } from './modules/digital-signature/digital-signature.module';
import { ImportModule } from './modules/import/import.module';

// Interceptors
import { TenantContextInterceptor } from './common/interceptors';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  controllers: [AppController, ...devControllers],
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
    UsersModule,
    DigitalSignatureModule,
    ChatModule,
    ImportModule,
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
    // TenantContextInterceptor define o contexto no request object
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
})
export class AppModule {
  // Middleware removido - contexto agora é gerenciado via Request-scoped service
}
