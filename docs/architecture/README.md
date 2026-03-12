# Arquitetura - Solid Service

Esta pasta contém a documentação arquitetural do projeto, incluindo ADRs (Architecture Decision Records) e diagramas técnicos.

## ADRs (Architecture Decision Records)

Os ADRs documentam decisões arquiteturais importantes tomadas durante o desenvolvimento.

### Decisões Principais

1. **Multi-tenancy Strategy**: Row-Level Isolation com tenant_id compartilhado
2. **Backend Framework**: NestJS para arquitetura modular e DI nativo
3. **Frontend Framework**: Next.js 14 com App Router para SSR e performance
4. **ORM**: Prisma para type-safety e DX superior
5. **Monorepo Tool**: Turborepo para gerenciamento eficiente

## Diagramas

### Arquitetura Geral

```
┌─────────────────────────────────────┐
│         FRONTEND                    │
│  Next.js 14 + TypeScript + Tailwind │
│  React Query + Zustand + Shadcn     │
└─────────────────────────────────────┘
              ↕ REST API
┌─────────────────────────────────────┐
│         BACKEND                     │
│  NestJS + TypeScript + Prisma       │
│  Multi-tenant (Row-Level)           │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│      INFRASTRUCTURE                 │
│  PostgreSQL 15 + Redis + S3/MinIO   │
│  Railway/Render (MVP)               │
└─────────────────────────────────────┘
```

### Fluxo de Request Multi-tenant

```
Cliente HTTP Request
  ↓
Middleware de Tenant (extrai tenantId do JWT)
  ↓
AsyncLocalStorage (armazena contexto)
  ↓
Controller → Service → Repository
  ↓
Prisma Middleware (injeta tenant_id automaticamente)
  ↓
Database Query (WHERE tenant_id = ?)
  ↓
Response
```

### Bounded Contexts (DDD)

```
┌─────────────────────────────────────┐
│  Customers (Gestão de Clientes)    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Quotations (Orçamentos)            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Service Orders (Ordens de Serviço) │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Financial (Financeiro)             │
└─────────────────────────────────────┘
```

## Princípios SOLID

Cada módulo segue os princípios SOLID:

- **S**ingle Responsibility: Cada classe tem uma única responsabilidade
- **O**pen/Closed: Aberto para extensão, fechado para modificação
- **L**iskov Substitution: Subtipos substituíveis por tipos base
- **I**nterface Segregation: Interfaces específicas melhor que genéricas
- **D**ependency Inversion: Depender de abstrações, não implementações
