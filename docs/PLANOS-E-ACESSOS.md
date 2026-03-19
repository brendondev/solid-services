# Planos e Acessos - Sistema de Assinaturas

## Objetivo
Implementar sistema completo de assinaturas (subscriptions) com diferentes planos, controle de acesso a features e billing integrado.

---

## 1. Modelo de Dados (Prisma Schema)

### 1.1 Tabela `Plan`
```prisma
model Plan {
  id          String   @id @default(uuid())
  slug        String   @unique // "free", "basic", "pro", "enterprise"
  name        String   // "Gratuito", "Básico", "Profissional", "Enterprise"
  description String?
  price       Decimal  @db.Decimal(10, 2) // Preço mensal em R$
  yearlyPrice Decimal? @map("yearly_price") @db.Decimal(10, 2) // Preço anual (desconto)

  // Limites
  limits      Json     // { maxUsers: 1, maxCustomers: 50, maxOrders: 20, maxStorage: 1024 }

  // Features (funcionalidades habilitadas)
  features    Json     // { nfe: false, whatsapp: false, api: false, reports: true }

  isActive    Boolean  @default(true) @map("is_active")
  sortOrder   Int      @map("sort_order") @default(0)

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  subscriptions Subscription[]

  @@map("plans")
}
```

### 1.2 Tabela `Subscription`
```prisma
model Subscription {
  id                String    @id @default(uuid())
  tenantId          String    @unique @map("tenant_id") // 1 subscription por tenant
  planId            String    @map("plan_id")

  status            String    @default("active") // active, canceled, past_due, trialing
  billingCycle      String    @map("billing_cycle") // monthly, yearly

  // Datas
  currentPeriodStart DateTime @map("current_period_start")
  currentPeriodEnd   DateTime @map("current_period_end")
  trialEndsAt        DateTime? @map("trial_ends_at")
  canceledAt         DateTime? @map("canceled_at")

  // Stripe/Paddle
  stripeCustomerId      String? @map("stripe_customer_id")
  stripeSubscriptionId  String? @map("stripe_subscription_id")

  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  plan   Plan   @relation(fields: [planId], references: [id], onDelete: Restrict)

  usageRecords UsageRecord[]

  @@index([tenantId])
  @@index([planId])
  @@index([status])
  @@index([currentPeriodEnd])
  @@map("subscriptions")
}
```

### 1.3 Tabela `UsageRecord` (Tracking de uso)
```prisma
model UsageRecord {
  id             String   @id @default(uuid())
  subscriptionId String   @map("subscription_id")
  tenantId       String   @map("tenant_id")

  metric         String   // "customers", "orders", "storage_mb", "api_calls"
  value          Int      // Quantidade usada
  recordedAt     DateTime @default(now()) @map("recorded_at")

  subscription Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  @@index([subscriptionId])
  @@index([tenantId, metric, recordedAt])
  @@map("usage_records")
}
```

### 1.4 Atualizar `Tenant`
```prisma
model Tenant {
  // ... campos existentes

  subscription Subscription?

  // Adicionar ao final
}
```

---

## 2. Definição dos Planos

### Plano FREE (Gratuito)
```json
{
  "slug": "free",
  "name": "Gratuito",
  "description": "Para começar",
  "price": 0,
  "limits": {
    "maxUsers": 1,
    "maxCustomers": 50,
    "maxOrders": 20,
    "maxStorage": 1024,       // 1 GB
    "maxMonthlyOrders": 20
  },
  "features": {
    "customers": true,
    "services": true,
    "quotations": true,
    "orders": true,
    "basic_financial": true,
    "portal_client": false,
    "nfe": false,
    "whatsapp": false,
    "api": false,
    "advanced_reports": false,
    "recurring_contracts": false,
    "custom_fields": false,
    "priority_support": false
  }
}
```

### Plano BASIC (Básico)
```json
{
  "slug": "basic",
  "name": "Básico",
  "description": "Para pequenos negócios",
  "price": 49.90,
  "yearlyPrice": 499.00,  // ~R$42/mês (16% desconto)
  "limits": {
    "maxUsers": 3,
    "maxCustomers": 500,
    "maxOrders": 200,
    "maxStorage": 10240,     // 10 GB
    "maxMonthlyOrders": 200
  },
  "features": {
    "customers": true,
    "services": true,
    "quotations": true,
    "orders": true,
    "basic_financial": true,
    "portal_client": true,
    "nfe": false,
    "whatsapp": false,
    "api": false,
    "advanced_reports": true,
    "recurring_contracts": true,
    "custom_fields": false,
    "priority_support": false
  }
}
```

### Plano PRO (Profissional)
```json
{
  "slug": "pro",
  "name": "Profissional",
  "description": "Para empresas em crescimento",
  "price": 99.90,
  "yearlyPrice": 999.00,   // ~R$83/mês (16% desconto)
  "limits": {
    "maxUsers": 10,
    "maxCustomers": -1,      // Ilimitado
    "maxOrders": -1,         // Ilimitado
    "maxStorage": 51200,     // 50 GB
    "maxMonthlyOrders": -1   // Ilimitado
  },
  "features": {
    "customers": true,
    "services": true,
    "quotations": true,
    "orders": true,
    "basic_financial": true,
    "portal_client": true,
    "nfe": true,
    "whatsapp": true,
    "api": false,
    "advanced_reports": true,
    "recurring_contracts": true,
    "custom_fields": true,
    "priority_support": true
  }
}
```

### Plano ENTERPRISE (Empresarial)
```json
{
  "slug": "enterprise",
  "name": "Enterprise",
  "description": "Para grandes operações",
  "price": 299.90,
  "yearlyPrice": 2999.00,  // ~R$250/mês (16% desconto)
  "limits": {
    "maxUsers": -1,          // Ilimitado
    "maxCustomers": -1,
    "maxOrders": -1,
    "maxStorage": 512000,    // 500 GB
    "maxMonthlyOrders": -1
  },
  "features": {
    "customers": true,
    "services": true,
    "quotations": true,
    "orders": true,
    "basic_financial": true,
    "portal_client": true,
    "nfe": true,
    "whatsapp": true,
    "api": true,
    "advanced_reports": true,
    "recurring_contracts": true,
    "custom_fields": true,
    "priority_support": true,
    "white_label": true,
    "dedicated_support": true
  }
}
```

---

## 3. Backend (NestJS)

### 3.1 Módulo `SubscriptionsModule`

**Estrutura:**
```
apps/api/src/modules/subscriptions/
├── subscriptions.module.ts
├── subscriptions.controller.ts
├── subscriptions.service.ts
├── plans.controller.ts
├── plans.service.ts
├── usage.service.ts
├── billing.service.ts (Stripe integration)
├── guards/
│   ├── plan-feature.guard.ts
│   └── usage-limit.guard.ts
├── decorators/
│   ├── requires-feature.decorator.ts
│   └── check-limit.decorator.ts
└── dto/
    ├── create-subscription.dto.ts
    ├── update-subscription.dto.ts
    └── usage-check.dto.ts
```

### 3.2 Service: `SubscriptionsService`

```typescript
@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) {}

  async getCurrentSubscription(): Promise<Subscription> {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });
  }

  async hasFeature(feature: string): Promise<boolean> {
    const subscription = await this.getCurrentSubscription();
    return subscription.plan.features[feature] === true;
  }

  async checkLimit(metric: string, currentValue: number): Promise<boolean> {
    const subscription = await this.getCurrentSubscription();
    const limit = subscription.plan.limits[metric];

    // -1 = ilimitado
    if (limit === -1) return true;

    return currentValue < limit;
  }

  async recordUsage(metric: string, value: number): Promise<void> {
    const tenantId = this.tenantContext.getTenantId();
    const subscription = await this.getCurrentSubscription();

    await this.prisma.usageRecord.create({
      data: {
        subscriptionId: subscription.id,
        tenantId,
        metric,
        value,
      },
    });
  }

  async upgradePlan(newPlanId: string): Promise<Subscription> {
    // Implementar upgrade com Stripe
  }

  async cancelSubscription(): Promise<Subscription> {
    // Implementar cancelamento
  }
}
```

### 3.3 Guard: `PlanFeatureGuard`

```typescript
@Injectable()
export class PlanFeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<string>(
      'requiredFeature',
      context.getHandler(),
    );

    if (!requiredFeature) {
      return true; // Sem restrição
    }

    const hasFeature = await this.subscriptionsService.hasFeature(requiredFeature);

    if (!hasFeature) {
      throw new ForbiddenException(
        `Esta funcionalidade requer um plano superior. Feature: ${requiredFeature}`
      );
    }

    return true;
  }
}
```

### 3.4 Decorator: `@RequiresFeature()`

```typescript
export const RequiresFeature = (feature: string) =>
  SetMetadata('requiredFeature', feature);

// Uso:
@Post('nfe')
@RequiresFeature('nfe')
async emitirNFe() {
  // Só executa se o plano tiver a feature "nfe"
}
```

### 3.5 Guard: `UsageLimitGuard`

```typescript
@Injectable()
export class UsageLimitGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
    private tenantContext: TenantContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limitCheck = this.reflector.get<{ metric: string; entity: string }>(
      'limitCheck',
      context.getHandler(),
    );

    if (!limitCheck) {
      return true;
    }

    const tenantId = this.tenantContext.getTenantId();
    const { metric, entity } = limitCheck;

    // Contar registros atuais
    const count = await this.prisma[entity].count({
      where: { tenantId },
    });

    const canCreate = await this.subscriptionsService.checkLimit(metric, count);

    if (!canCreate) {
      throw new ForbiddenException(
        `Limite de ${metric} atingido. Faça upgrade do seu plano.`
      );
    }

    return true;
  }
}
```

### 3.6 Decorator: `@CheckLimit()`

```typescript
export const CheckLimit = (metric: string, entity: string) =>
  SetMetadata('limitCheck', { metric, entity });

// Uso:
@Post()
@CheckLimit('maxCustomers', 'customer')
async createCustomer() {
  // Só cria se não atingiu o limite
}
```

### 3.7 Endpoints da API

```typescript
// GET /api/v1/subscriptions/current
// GET /api/v1/subscriptions/usage
// POST /api/v1/subscriptions/upgrade
// POST /api/v1/subscriptions/cancel
// GET /api/v1/plans
// GET /api/v1/plans/:slug
// POST /api/v1/billing/create-checkout
// POST /api/v1/billing/webhook (Stripe)
```

---

## 4. Frontend (Next.js)

### 4.1 Hook: `useSubscription`

```typescript
// apps/web/src/hooks/useSubscription.ts
export function useSubscription() {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.get('/subscriptions/current').then(r => r.data),
  });

  const hasFeature = (feature: string) => {
    return subscription?.plan?.features?.[feature] === true;
  };

  const isWithinLimit = (metric: string, currentValue: number) => {
    const limit = subscription?.plan?.limits?.[metric];
    if (limit === -1) return true; // Ilimitado
    return currentValue < limit;
  };

  const canCreateMore = async (entity: string) => {
    const usage = await api.get('/subscriptions/usage').then(r => r.data);
    return isWithinLimit(`max${entity}`, usage[entity]);
  };

  return {
    subscription,
    isLoading,
    hasFeature,
    isWithinLimit,
    canCreateMore,
    plan: subscription?.plan,
  };
}
```

### 4.2 Componente: `PlanBadge`

```typescript
// apps/web/src/components/subscription/PlanBadge.tsx
export function PlanBadge() {
  const { plan, isLoading } = useSubscription();

  if (isLoading) return <Skeleton className="h-6 w-20" />;

  const colors = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    pro: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-gold-100 text-gold-800',
  };

  return (
    <Badge className={colors[plan?.slug] || colors.free}>
      {plan?.name || 'Gratuito'}
    </Badge>
  );
}
```

### 4.3 Componente: `FeatureGate`

```typescript
// apps/web/src/components/subscription/FeatureGate.tsx
interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { hasFeature } = useSubscription();

  if (!hasFeature(feature)) {
    return fallback || (
      <UpgradePrompt feature={feature} />
    );
  }

  return <>{children}</>;
}

// Uso:
<FeatureGate feature="nfe">
  <Button onClick={emitirNFe}>Emitir NF-e</Button>
</FeatureGate>
```

### 4.4 Componente: `UpgradePrompt`

```typescript
// apps/web/src/components/subscription/UpgradePrompt.tsx
export function UpgradePrompt({ feature }: { feature: string }) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <Lock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        Feature Bloqueada
      </h3>
      <p className="text-gray-600 mb-4">
        Faça upgrade do seu plano para desbloquear esta funcionalidade.
      </p>
      <Button onClick={() => router.push('/settings/billing')}>
        Ver Planos
      </Button>
    </div>
  );
}
```

### 4.5 Página: Billing/Planos

```typescript
// apps/web/src/app/dashboard/settings/billing/page.tsx
export default function BillingPage() {
  const { subscription, plan } = useSubscription();
  const plans = usePlans(); // Busca todos os planos

  return (
    <div className="space-y-8">
      {/* Plano Atual */}
      <Card>
        <CardHeader>
          <CardTitle>Plano Atual</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{plan?.name}</h3>
              <p className="text-muted-foreground">
                R$ {plan?.price}/mês
              </p>
            </div>
            <PlanBadge />
          </div>

          {/* Uso Atual */}
          <UsageProgress />
        </CardBody>
      </Card>

      {/* Comparação de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {plans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.id === subscription?.planId}
          />
        ))}
      </div>
    </div>
  );
}
```

### 4.6 Componente: `UsageProgress`

```typescript
// apps/web/src/components/subscription/UsageProgress.tsx
export function UsageProgress() {
  const { plan } = useSubscription();
  const usage = useUsage(); // Busca uso atual

  const metrics = [
    { key: 'customers', label: 'Clientes', icon: Users },
    { key: 'orders', label: 'Ordens', icon: ClipboardList },
    { key: 'storage', label: 'Armazenamento', icon: HardDrive },
  ];

  return (
    <div className="space-y-4 mt-6">
      {metrics.map(({ key, label, icon: Icon }) => {
        const limit = plan?.limits?.[`max${key}`];
        const current = usage?.[key] || 0;
        const percentage = limit === -1 ? 0 : (current / limit) * 100;
        const isUnlimited = limit === -1;

        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {current} {!isUnlimited && `/ ${limit}`}
                {isUnlimited && '(Ilimitado)'}
              </span>
            </div>
            {!isUnlimited && (
              <Progress value={percentage} className={
                percentage > 80 ? 'bg-red-200' : 'bg-blue-200'
              } />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

---

## 5. Integração com Stripe

### 5.1 Setup

```bash
npm install stripe @nestjs/stripe
```

### 5.2 BillingService

```typescript
// apps/api/src/modules/subscriptions/billing.service.ts
@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.stripe = new Stripe(config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(planId: string, tenantId: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: tenant.email,
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: plan.name,
            description: plan.description,
          },
          recurring: {
            interval: 'month',
          },
          unit_amount: Math.round(Number(plan.price) * 100), // Centavos
        },
        quantity: 1,
      }],
      metadata: {
        tenantId,
        planId,
      },
      success_url: `${process.env.FRONTEND_URL}/settings/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/settings/billing?canceled=true`,
    });

    return { url: session.url };
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const { tenantId, planId } = session.metadata;

    // Criar/Atualizar subscription
    await this.prisma.subscription.upsert({
      where: { tenantId },
      create: {
        tenantId,
        planId,
        status: 'active',
        billingCycle: 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
      },
      update: {
        planId,
        status: 'active',
        stripeSubscriptionId: session.subscription as string,
      },
    });
  }
}
```

### 5.3 Webhook Endpoint

```typescript
@Controller('billing')
export class BillingController {
  @Post('webhook')
  @Header('Content-Type', 'application/json')
  async handleWebhook(@Req() req: Request) {
    const sig = req.headers['stripe-signature'];
    const event = this.stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    await this.billingService.handleWebhook(event);

    return { received: true };
  }
}
```

---

## 6. Migrations

### Ordem de execução:

```bash
# 1. Criar migration
cd packages/database
npx prisma migrate dev --name add_subscriptions_system

# 2. Seed com planos iniciais
npx prisma db seed
```

### Seed Script:

```typescript
// packages/database/prisma/seed.ts
const plans = [
  {
    slug: 'free',
    name: 'Gratuito',
    description: 'Para começar',
    price: 0,
    limits: { maxUsers: 1, maxCustomers: 50, maxOrders: 20 },
    features: { customers: true, nfe: false },
    sortOrder: 1,
  },
  // ... outros planos
];

for (const plan of plans) {
  await prisma.plan.create({ data: plan });
}
```

---

## 7. Testes

### 7.1 Unit Tests

```typescript
describe('SubscriptionsService', () => {
  it('should check feature access', async () => {
    const hasNFe = await service.hasFeature('nfe');
    expect(hasNFe).toBe(false); // Plano free
  });

  it('should enforce usage limits', async () => {
    const canCreate = await service.checkLimit('maxCustomers', 50);
    expect(canCreate).toBe(false); // Limite atingido
  });
});
```

### 7.2 E2E Tests

```typescript
it('should block feature without proper plan', async () => {
  const response = await request(app.getHttpServer())
    .post('/nfe')
    .set('Authorization', `Bearer ${token}`)
    .expect(403);

  expect(response.body.message).toContain('Feature: nfe');
});
```

---

## 8. Checklist de Implementação

### Backend
- [ ] Criar models no Prisma (Plan, Subscription, UsageRecord)
- [ ] Migration + Seed de planos
- [ ] SubscriptionsModule completo
- [ ] Guards (PlanFeatureGuard, UsageLimitGuard)
- [ ] Decorators (@RequiresFeature, @CheckLimit)
- [ ] BillingService (Stripe integration)
- [ ] Webhook handler
- [ ] Testes unitários
- [ ] Testes E2E

### Frontend
- [ ] Hook useSubscription
- [ ] Componente PlanBadge
- [ ] Componente FeatureGate
- [ ] Componente UpgradePrompt
- [ ] Componente UsageProgress
- [ ] Componente PlanCard
- [ ] Página /settings/billing
- [ ] Integração com Stripe Checkout

### Infraestrutura
- [ ] Variáveis de ambiente Stripe
- [ ] Webhook endpoint configurado
- [ ] CORS para Stripe
- [ ] Testes de pagamento (Stripe Test Mode)

---

## 9. Cronograma Estimado

| Fase | Tarefas | Tempo |
|------|---------|-------|
| **Semana 1** | Models + Migration + Seed | 2 dias |
| | Backend: Services + Guards | 3 dias |
| **Semana 2** | Frontend: Hooks + Components | 3 dias |
| | Página de Billing | 2 dias |
| **Semana 3** | Stripe Integration | 3 dias |
| | Testes + Ajustes | 2 dias |

**Total: ~3 semanas**

---

## 10. Próximos Passos (Após Implementação)

1. Testar com Stripe Test Mode
2. Criar documentação de uso
3. Implementar trial period de 14 dias
4. Adicionar analytics de conversão
5. Implementar downgrade gracioso
6. Email marketing para upgrade
7. Página pública de pricing

---

## Observações Importantes

### Multi-tenant + Billing
- Cada tenant tem 1 subscription
- Subscription pode mudar de plano (upgrade/downgrade)
- Limites são verificados em tempo real
- Features bloqueadas mostram prompt de upgrade

### Stripe Webhooks
- Essencial para sincronizar status de pagamento
- Testar todos os eventos (payment_succeeded, payment_failed, subscription_deleted)
- Logs detalhados para debug

### Trial Period
- 14 dias grátis no primeiro signup
- Após trial, vai para Free ou cobra cartão
- Email de lembrete 3 dias antes do fim

### Graceful Degradation
- Ao fazer downgrade, não deletar dados
- Apenas bloquear criação de novos registros
- Permitir visualização de registros antigos
- Exportar dados antes de cancelar

---

**Pronto para implementar!** 🚀
