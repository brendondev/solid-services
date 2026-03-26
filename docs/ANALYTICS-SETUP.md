# Analytics & Error Tracking - Setup Guide

## ✅ O que foi implementado

Sistema completo de observabilidade com:
- 📊 **Analytics** (Google Analytics 4 / Vercel Analytics)
- 🐛 **Error Tracking** (preparado para Sentry)
- 📝 **Event Tracking** para ações importantes
- 💬 **User Feedback** com botão flutuante
- 📈 **Performance Monitoring** preparado

## 📁 Arquitetura

```
apps/web/src/
├── lib/
│   ├── analytics/          # Sistema de analytics
│   │   └── index.ts        # Analytics service + helpers
│   └── error-tracking/     # Error tracking
│       └── index.ts        # Error tracking service
├── hooks/
│   └── useAnalytics.ts     # Hooks de analytics
└── components/
    └── feedback/
        └── feedback-button.tsx  # Botão de feedback
```

## 🚀 Como Usar

### 1. Configurar Variáveis de Ambiente

Criar/editar `.env.local`:
```bash
# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry (opcional)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
```

### 2. Inicializar no Layout

Já está configurado em `app/layout.tsx` (se não estiver, adicionar):

```typescript
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { analytics } from '@/lib/analytics';
import { errorTracking } from '@/lib/error-tracking';
import { usePageTracking } from '@/hooks/useAnalytics';

export function AnalyticsProvider({ children }) {
  const { user } = useAuth();

  // Inicializar analytics
  useEffect(() => {
    analytics.initialize({
      gaId: process.env.NEXT_PUBLIC_GA_ID,
      userId: user?.id,
    });

    if (user) {
      analytics.identifyUser({
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        plan: user.subscription?.plan.slug,
      });

      errorTracking.setUser({
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
      });
    }
  }, [user]);

  // Rastrear pageviews automaticamente
  usePageTracking();

  return children;
}
```

### 3. Rastrear Eventos

#### Eventos Pré-Configurados

```typescript
import { trackEvent } from '@/lib/analytics';

// Autenticação
trackEvent.login();
trackEvent.logout();
trackEvent.signup('pro');

// Clientes
trackEvent.customerCreated();
trackEvent.customerUpdated();
trackEvent.customerDeleted();

// Ordens
trackEvent.orderCreated(150.00);
trackEvent.orderCompleted(150.00);
trackEvent.orderCancelled();

// Financeiro
trackEvent.paymentReceived(150.00);
trackEvent.invoiceGenerated();

// Planos
trackEvent.planUpgraded('basic', 'pro');
trackEvent.planDowngraded('pro', 'basic');

// Features
trackEvent.featureUsed('agenda_drag_drop');
trackEvent.featureUsed('pdf_export');

// PWA
trackEvent.pwaInstalled();
trackEvent.pwaPromptShown();

// Busca
trackEvent.searchPerformed('cliente abc', 5);
```

#### Eventos Customizados

```typescript
import { analytics } from '@/lib/analytics';

analytics.track({
  name: 'custom_event',
  properties: {
    category: 'engagement',
    label: 'feature_discovery',
    value: 1,
  },
});

// Com valor monetário
analytics.track({
  name: 'purchase',
  value: 99.90,
  properties: {
    currency: 'BRL',
    items: ['item1', 'item2'],
  },
});
```

### 4. Error Tracking

#### Capturar Exceções

```typescript
import { errorTracking } from '@/lib/error-tracking';

try {
  await riskyOperation();
} catch (error) {
  errorTracking.captureException(error, {
    user: {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
    },
    tags: {
      operation: 'create_order',
      module: 'orders',
    },
    extra: {
      orderId: order.id,
      customerId: customer.id,
    },
    level: 'error',
  });

  throw error; // Re-throw se necessário
}
```

#### Helpers

```typescript
import { withErrorTracking, tryCatch } from '@/lib/error-tracking';

// Async com auto-tracking
await withErrorTracking(
  async () => {
    await api.createOrder(data);
  },
  { tags: { operation: 'create_order' } }
);

// Sync com fallback null
const result = tryCatch(
  () => JSON.parse(unsafeString),
  { tags: { operation: 'json_parse' } }
);
```

#### Breadcrumbs (Rastro de Navegação)

```typescript
import { errorTracking } from '@/lib/error-tracking';

// Adicionar contexto antes de operação
errorTracking.addBreadcrumb('User clicked create button', 'user_action');
errorTracking.addBreadcrumb('Form validated successfully', 'validation');
errorTracking.addBreadcrumb('API request started', 'api', {
  endpoint: '/orders',
  method: 'POST',
});

// Se der erro, breadcrumbs aparecem no Sentry
```

### 5. Feedback do Usuário

Adicionar botão de feedback no dashboard:

```typescript
import { FeedbackButton } from '@/components/feedback/feedback-button';

export default function DashboardLayout({ children }) {
  return (
    <div>
      {children}
      <FeedbackButton />
    </div>
  );
}
```

O botão flutuante permite usuários enviarem:
- 🐛 Reportar bugs
- 💡 Sugerir features
- 💬 Outros feedbacks

## 📊 Google Analytics 4

### Setup

1. Criar conta no [Google Analytics](https://analytics.google.com/)
2. Criar propriedade GA4
3. Copiar Measurement ID (G-XXXXXXXXXX)
4. Adicionar em `.env.local`:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

### Eventos Automáticos

Já são rastreados automaticamente:
- ✅ Pageviews (todas as páginas)
- ✅ Session start
- ✅ First visit
- ✅ Engagement time

### Eventos Manuais

Configure metas/conversões no GA4 Dashboard:
- `signup` → Cadastro de novo tenant
- `login` → Login de usuário
- `order_created` → Nova ordem criada
- `order_completed` → Ordem finalizada
- `payment_received` → Pagamento recebido
- `plan_upgraded` → Upgrade de plano

### Visualizar Dados

1. Acesse [Google Analytics](https://analytics.google.com/)
2. Selecione sua propriedade
3. **Relatórios** > **Eventos**
4. Veja eventos em tempo real e históricos

## 🐛 Sentry Setup (Opcional mas Recomendado)

### Instalação

```bash
cd apps/web
npm install --save @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Configuração Automática

O wizard cria:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- Atualiza `next.config.js`

### Variáveis de Ambiente

```bash
# .env.local (público)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# .env.local (privado)
SENTRY_AUTH_TOKEN=xxx
SENTRY_ORG=sua-org
SENTRY_PROJECT=solid-service-web
```

### Integrar com Código Existente

Editar `src/lib/error-tracking/index.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

class ErrorTrackingService {
  initialize(config?: { dsn?: string }) {
    if (config?.dsn && this.enabled) {
      // Já configurado pelo Sentry wizard
      // Apenas ajustar opções se necessário
      Sentry.init({
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
    }
  }

  captureException(error: Error, context?: ErrorContext) {
    Sentry.captureException(error, {
      user: context?.user,
      tags: context?.tags,
      extra: context?.extra,
      level: context?.level || 'error',
    });
  }

  // ... resto do código
}
```

### Recursos do Sentry

- **Error Tracking**: Captura automática de exceções
- **Source Maps**: Stacktraces legíveis mesmo minificados
- **Releases**: Rastreamento de versões
- **Performance**: Tracing de requisições lentas
- **Session Replay**: Gravação de sessões com erros
- **Alerts**: Notificações de erros no Slack/Email

## 📈 Vercel Analytics (Alternativa)

### Setup

```bash
cd apps/web
npm install @vercel/analytics
```

### Configuração

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Recursos

- ✅ Pageviews automáticos
- ✅ Web Vitals (LCP, FID, CLS)
- ✅ Dispositivos e navegadores
- ✅ Países e cidades
- ✅ Referrers
- ❌ Eventos customizados (requer plano Pro)

## 🎯 Eventos Importantes para Rastrear

### Negócio
- [ ] Cadastro de novo tenant (`signup`)
- [ ] Primeiro login (`first_login`)
- [ ] Criação de cliente (`customer_created`)
- [ ] Criação de ordem (`order_created`)
- [ ] Conclusão de ordem (`order_completed`)
- [ ] Pagamento recebido (`payment_received`)
- [ ] Upgrade de plano (`plan_upgraded`)

### Engajamento
- [ ] Feature descoberta (`feature_discovered`)
- [ ] Feature usada (`feature_used`)
- [ ] Tempo na plataforma (automático)
- [ ] Páginas mais visitadas (automático)

### Problemas
- [ ] Erro de API (`api_error`)
- [ ] Erro de validação (`validation_error`)
- [ ] Timeout (`timeout_error`)
- [ ] Sessão expirada (`session_expired`)

### Conversão
- [ ] Visualizou página de planos (`view_plans`)
- [ ] Iniciou upgrade (`start_upgrade`)
- [ ] Completou upgrade (`complete_upgrade`)
- [ ] Cancelou assinatura (`cancel_subscription`)

## 🔍 Debugging

### Ver Eventos no Console (Development)

Os eventos aparecem automaticamente no console em desenvolvimento:
```
[Analytics] Event: order_created { value: 150, customerId: 'abc123' }
[Analytics] Pageview: /dashboard/orders
[Error Tracking] Exception: Error: Failed to save { user: {...}, tags: {...} }
```

### Testar sem Enviar

```typescript
// Desabilitar temporariamente
const analytics = new AnalyticsService();
analytics.enabled = false;

// Ou usar variável de ambiente
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

### Verificar Integração

1. **Google Analytics**: Real-Time reports mostram eventos imediatamente
2. **Sentry**: Ver em Sentry > Issues
3. **Console do Browser**: Abrir DevTools > Console

## 📊 Relatórios Úteis

### Google Analytics 4

#### Funil de Conversão
```
1. Pageview /dashboard/planos (visualizou planos)
2. Event: start_upgrade (iniciou upgrade)
3. Event: complete_upgrade (completou)
```

#### Engagement
```
- Usuários ativos diários/mensais
- Tempo médio na plataforma
- Páginas por sessão
- Taxa de rejeição
```

#### Revenue (com ecommerce)
```
- Receita por plano
- LTV (Lifetime Value)
- Churn rate
```

### Sentry

#### Performance
```
- Transações mais lentas
- Endpoints problemáticos
- Tempo de carregamento por página
```

#### Errors
```
- Erros mais frequentes
- Erros por usuário/tenant
- Trends de erros (aumentando/diminuindo)
```

## 🚀 Best Practices

1. **Não rastreie dados sensíveis**
   - ❌ Senhas, tokens, cartões de crédito
   - ✅ IDs, categorias, timestamps

2. **Use naming consistente**
   ```typescript
   // ✅ Bom: snake_case consistente
   trackEvent.order_created();
   trackEvent.payment_received();

   // ❌ Ruim: mistura de formatos
   trackEvent.orderCreated();
   trackEvent.PaymentReceived();
   ```

3. **Adicione contexto aos eventos**
   ```typescript
   // ✅ Bom: rico em contexto
   analytics.track({
     name: 'order_created',
     value: order.total,
     properties: {
       customer_type: customer.type,
       payment_method: payment.method,
       items_count: order.items.length,
     },
   });

   // ❌ Ruim: sem contexto
   analytics.track({ name: 'order_created' });
   ```

4. **Não abuse de eventos**
   - Evite rastrear toda interação (hover, scroll, etc)
   - Foque em ações significativas
   - Agrupe eventos similares

5. **Teste eventos em desenvolvimento**
   - Sempre verificar console antes de fazer deploy
   - Validar dados enviados
   - Confirmar eventos aparecem no GA4/Sentry

## 📚 Referências

- [Google Analytics 4 Docs](https://developers.google.com/analytics/devguides/collection/ga4)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Analytics](https://vercel.com/analytics)
- [Web Vitals](https://web.dev/vitals/)

---

**Status**: ✅ Sistema preparado e documentado
**Próximo passo**: Configurar Google Analytics e/ou Sentry
**Custo**: GA4 (grátis), Sentry (grátis até 5k eventos/mês), Vercel Analytics (grátis basic)
