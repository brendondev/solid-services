# Sistema de Subscriptions (Planos e Acessos) - API Reference

## Visão Geral

Sistema completo de assinaturas (subscriptions) com diferentes planos, controle de acesso a features e billing integrado.

**Status**: ✅ Backend Completo | ⏳ Frontend Pendente

---

## Planos Disponíveis

### 🆓 FREE (Gratuito)
- **Preço**: R$ 0/mês
- **Limites**:
  - 1 usuário
  - 10 clientes
  - 5 ordens por mês
  - 100 MB de armazenamento
- **Features**:
  - ✅ Reports básicos
  - ❌ NFe
  - ❌ WhatsApp
  - ❌ API

### 💼 BASIC (Básico)
- **Preço**: R$ 49,90/mês (R$ 499/ano)
- **Limites**:
  - 3 usuários
  - 100 clientes
  - 50 ordens por mês
  - 1 GB de armazenamento
- **Features**:
  - ✅ Reports básicos
  - ✅ WhatsApp
  - ❌ NFe
  - ❌ API

### 🚀 PRO (Profissional)
- **Preço**: R$ 99,90/mês (R$ 999/ano)
- **Limites**:
  - 10 usuários
  - 500 clientes
  - 200 ordens por mês
  - 5 GB de armazenamento
- **Features**:
  - ✅ Reports básicos e avançados
  - ✅ WhatsApp
  - ✅ NFe/NFS-e
  - ✅ API Access
  - ✅ Customização

### 🏢 ENTERPRISE
- **Preço**: R$ 299,90/mês (R$ 2.999/ano)
- **Limites**: Ilimitados
- **Features**: Todas + suporte dedicado

---

## Endpoints REST

### **Planos**

#### `GET /api/v1/subscriptions/plans`
Lista todos os planos disponíveis.

**Response**:
```json
[
  {
    "id": "uuid",
    "slug": "free",
    "name": "Gratuito",
    "description": "Plano gratuito para começar",
    "price": 0,
    "yearlyPrice": 0,
    "limits": {
      "maxUsers": 1,
      "maxCustomers": 10,
      "maxOrders": 5,
      "maxStorage": 100
    },
    "features": {
      "nfe": false,
      "whatsapp": false,
      "api": false,
      "reports": true
    },
    "isActive": true,
    "sortOrder": 1
  }
]
```

#### `GET /api/v1/subscriptions/plans/:slug`
Obter detalhes de um plano específico.

**Exemplo**: `GET /api/v1/subscriptions/plans/pro`

---

### **Assinatura Atual**

#### `GET /api/v1/subscriptions/current`
Obter assinatura atual do tenant.

**Response**:
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "planId": "uuid",
  "status": "active",
  "billingCycle": "monthly",
  "currentPeriodStart": "2024-03-01T00:00:00Z",
  "currentPeriodEnd": "2024-04-01T00:00:00Z",
  "plan": {
    "slug": "basic",
    "name": "Básico",
    "price": 49.90,
    ...
  }
}
```

#### `GET /api/v1/subscriptions/status`
Obter status completo (assinatura + uso atual + limites).

**Response**:
```json
{
  "subscription": { ... },
  "usage": [
    {
      "metric": "users",
      "currentValue": 2,
      "limit": 3,
      "percentage": 66.67,
      "isUnlimited": false
    },
    {
      "metric": "customers",
      "currentValue": 45,
      "limit": 100,
      "percentage": 45,
      "isUnlimited": false
    }
  ],
  "daysUntilRenewal": 12,
  "canUpgrade": true,
  "canDowngrade": false
}
```

---

### **Gerenciamento**

#### `PATCH /api/v1/subscriptions/update`
Atualizar assinatura (upgrade/downgrade ou mudar billing cycle).

**Request Body**:
```json
{
  "planId": "uuid-do-novo-plano",
  "billingCycle": "yearly"  // ou "monthly"
}
```

**Response**: SubscriptionDto atualizado

#### `POST /api/v1/subscriptions/cancel`
Cancelar assinatura.

**Request Body** (opcional):
```json
{
  "reason": "expensive",
  "feedback": "Está muito caro para o meu negócio atual"
}
```

#### `POST /api/v1/subscriptions/reactivate`
Reativar assinatura cancelada.

---

### **Verificação de Features**

#### `GET /api/v1/subscriptions/features/:featureName`
Verificar se o plano atual possui uma feature específica.

**Exemplo**: `GET /api/v1/subscriptions/features/nfe`

**Response**:
```json
{
  "hasFeature": true
}
```

#### `GET /api/v1/subscriptions/limits/:metric`
Verificar se ainda há espaço no limite.

**Exemplo**: `GET /api/v1/subscriptions/limits/maxCustomers`

**Response**:
```json
{
  "canProceed": true
}
```

---

## Guards e Decorators

### **@RequiresFeature**

Protege endpoints que necessitam de uma feature específica.

```typescript
import { RequiresFeature } from '@common/decorators';
import { UseGuards } from '@nestjs/common';
import { PlanFeatureGuard } from '@common/guards';

@Post('nfe')
@UseGuards(PlanFeatureGuard)
@RequiresFeature('nfe')
async emitirNFe() {
  // Só executa se o plano tiver a feature "nfe"
}
```

**Erro retornado se feature não disponível**:
```json
{
  "statusCode": 403,
  "message": "Esta funcionalidade requer um plano superior. Feature necessária: nfe"
}
```

### **@CheckLimit**

Verifica se ainda há espaço no limite antes de criar um recurso.

```typescript
import { CheckLimit } from '@common/decorators';
import { UseGuards } from '@nestjs/common';
import { UsageLimitGuard } from '@common/guards';

@Post('customers')
@UseGuards(UsageLimitGuard)
@CheckLimit('maxCustomers')
async createCustomer(@Body() dto: CreateCustomerDto) {
  // Só executa se ainda tiver espaço no limite de customers
}
```

**Erro retornado se limite atingido**:
```json
{
  "statusCode": 403,
  "message": "Limite atingido para maxCustomers. Faça upgrade do seu plano para continuar."
}
```

---

## Como Usar nos Módulos

### Exemplo 1: Proteger criação de NFe

```typescript
// nfe.controller.ts
import { RequiresFeature } from '@common/decorators';
import { PlanFeatureGuard } from '@common/guards';

@Controller('api/v1/nfe')
@UseGuards(JwtAuthGuard, PlanFeatureGuard)
export class NFeController {

  @Post()
  @RequiresFeature('nfe')
  async emitir(@Body() dto: EmitirNFeDto) {
    // Implementação
  }
}
```

### Exemplo 2: Limitar criação de clientes

```typescript
// customers.controller.ts
import { CheckLimit } from '@common/decorators';
import { UsageLimitGuard } from '@common/guards';

@Controller('api/v1/customers')
@UseGuards(JwtAuthGuard, UsageLimitGuard)
export class CustomersController {

  @Post()
  @CheckLimit('maxCustomers')
  async create(@Body() dto: CreateCustomerDto) {
    // Implementação
  }
}
```

### Exemplo 3: Registrar uso após ação

```typescript
// service-orders.service.ts
import { SubscriptionsService } from '@modules/subscriptions';

@Injectable()
export class ServiceOrdersService {
  constructor(
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async create(dto: CreateServiceOrderDto) {
    const order = await this.prisma.serviceOrder.create({ ... });

    // Registrar uso
    await this.subscriptionsService.recordUsage('orders', 1);

    return order;
  }
}
```

---

## Schema Prisma

```prisma
model Plan {
  id          String   @id @default(uuid())
  slug        String   @unique
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  yearlyPrice Decimal? @map("yearly_price") @db.Decimal(10, 2)
  limits      Json
  features    Json
  isActive    Boolean  @default(true) @map("is_active")
  sortOrder   Int      @default(0) @map("sort_order")

  subscriptions Subscription[]

  @@map("plans")
}

model Subscription {
  id         String @id @default(uuid())
  tenantId   String @unique @map("tenant_id")
  planId     String @map("plan_id")
  status     String @default("active")
  billingCycle String @map("billing_cycle")

  currentPeriodStart DateTime  @map("current_period_start")
  currentPeriodEnd   DateTime  @map("current_period_end")
  trialEndsAt        DateTime? @map("trial_ends_at")
  canceledAt         DateTime? @map("canceled_at")

  stripeCustomerId     String? @map("stripe_customer_id")
  stripeSubscriptionId String? @map("stripe_subscription_id")

  tenant       Tenant        @relation(...)
  plan         Plan          @relation(...)
  usageRecords UsageRecord[]

  @@map("subscriptions")
}

model UsageRecord {
  id             String   @id @default(uuid())
  subscriptionId String   @map("subscription_id")
  tenantId       String   @map("tenant_id")
  metric         String
  value          Int
  recordedAt     DateTime @default(now()) @map("recorded_at")

  subscription Subscription @relation(...)

  @@map("usage_records")
}
```

---

## Seed

Os planos são criados automaticamente no seed:

```bash
cd packages/database
npx ts-node prisma/seed/index.ts
```

Todos os tenants criados recebem automaticamente uma **assinatura FREE** por padrão.

---

## Próximos Passos (Pendente)

### Backend (Futuro)
- [ ] Integração com Stripe para billing
- [ ] Webhooks do Stripe (payment.succeeded, subscription.updated)
- [ ] Cronjob para verificar assinaturas expiradas
- [ ] Email notifications (upgrade, downgrade, expiration)
- [ ] Audit log de mudanças de plano

### Frontend (A fazer)
- [ ] Página de planos (/dashboard/settings/subscription)
- [ ] Componente PlanCard
- [ ] Modal de upgrade/downgrade
- [ ] Dashboard de uso (usage bars)
- [ ] Billing history
- [ ] Payment method management

---

## Testando

### 1. Listar planos disponíveis
```bash
curl -X GET http://localhost:3000/api/v1/subscriptions/plans \
  -H "Authorization: Bearer {token}"
```

### 2. Ver assinatura atual
```bash
curl -X GET http://localhost:3000/api/v1/subscriptions/current \
  -H "Authorization: Bearer {token}"
```

### 3. Ver status e uso
```bash
curl -X GET http://localhost:3000/api/v1/subscriptions/status \
  -H "Authorization: Bearer {token}"
```

### 4. Fazer upgrade para PRO
```bash
curl -X PATCH http://localhost:3000/api/v1/subscriptions/update \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"planId": "{uuid-do-plano-pro}"}'
```

---

**Implementado em**: 2026-03-19
**Commit**: `feat(subscriptions): implementar sistema completo de Planos e Assinaturas`
