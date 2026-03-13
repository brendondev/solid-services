# Solid Service - ERP SaaS Multi-tenant

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-blue.svg)](https://www.typescriptlang.org)
[![NestJS](https://img.shields.io/badge/nestjs-10.0%2B-red.svg)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/next.js-14.0%2B-black.svg)](https://nextjs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Sistema ERP multi-tenant completo para prestadores de serviços (MEIs, autônomos e pequenas empresas). Gerenciamento de clientes, orçamentos, ordens de serviço, agendamento e financeiro em uma única plataforma.

**Status:** 🚀 MVP 95% completo - Pronto para produção

---

## ✨ Features Principais

### ✅ Implementado (37/39 tasks)

- **🏢 Multi-tenancy** - Isolamento completo de dados por tenant (Row-Level Isolation)
- **🔐 Autenticação & Autorização** - JWT + Refresh Tokens + RBAC (4 roles)
- **👥 Gestão de Clientes** - CRUD completo com contatos e endereços
- **🛠️ Catálogo de Serviços** - Gerenciamento de serviços oferecidos
- **💰 Orçamentos** - Criação, aprovação/rejeição, conversão em OS
- **📋 Ordens de Serviço** - Workflow completo com timeline e checklists
- **📅 Agendamento** - Atribuição de técnicos e datas
- **📎 Anexos** - Upload para S3/MinIO
- **💵 Financeiro** - Recebíveis, pagamentos parciais, dashboard
- **📧 Notificações** - Sistema de emails via Resend (7 templates)
- **🌐 Portal do Cliente** - Acesso público para aprovação de orçamentos
- **📊 Dashboard** - Métricas operacionais e financeiras
- **📄 Geração de PDF** - Orçamentos em PDF
- **🔍 Audit Log** - Rastreamento de todas ações críticas
- **⚡ Performance** - 32 índices estratégicos + compression HTTP (queries 10x+ rápidas)
- **🧪 Testes E2E** - 85+ testes cobrindo todos fluxos críticos
- **📚 Documentação** - Guias completos de setup, deploy, API e contribuição

### 🔜 Próximas Tasks (2 restantes)

- **CI/CD** - GitHub Actions para deploy automático
- **Onboarding** - Cliente piloto e feedback

---

## 🚀 Stack Tecnológica

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL 15+ com Prisma ORM
- **Storage**: AWS S3 / MinIO (S3-compatible)
- **Auth**: JWT + Refresh Tokens
- **Email**: Resend
- **Docs**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **State**: React Query + Zustand
- **UI**: Shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod

### DevOps
- **Monorepo**: Turborepo
- **CI/CD**: GitHub Actions
- **Hosting**: Railway (backend), Vercel (frontend)
- **Monitoring**: Sentry (opcional)

---

## 📁 Estrutura do Projeto

```
solid-service/
├── apps/
│   ├── api/                    # Backend NestJS ✅
│   │   ├── src/
│   │   │   ├── core/           # Infraestrutura (database, auth, tenant)
│   │   │   ├── modules/        # 6 módulos de negócio
│   │   │   └── common/         # Guards, decorators, middleware
│   │   └── test/               # 85+ testes E2E
│   │
│   └── web/                    # Frontend Next.js ✅
│       ├── src/
│       │   ├── app/            # App Router (Next.js 14)
│       │   ├── components/     # Componentes React
│       │   └── lib/            # Utils, hooks, stores
│       └── public/
│
├── packages/
│   ├── database/               # Prisma (14 tabelas, 32 índices) ✅
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       ├── migrations/
│   │       └── seed.ts
│   ├── shared/                 # Types compartilhados
│   └── ui/                     # Componentes UI (Shadcn)
│
├── docs/                       # Documentação completa ✅
│   └── planning/
│
├── SETUP.md                    # 🔧 Guia de instalação local
├── DEPLOY.md                   # 🚀 Guia de deploy produção
├── API.md                      # 📖 Documentação da API
├── CONTRIBUTING.md             # 🤝 Guia de contribuição
├── RBAC.md                     # 🔐 Controle de acesso
└── package.json                # Workspace root
```

---

## 🛠️ Quick Start

### Pré-requisitos

- **Node.js** 18+ ([download](https://nodejs.org))
- **PostgreSQL** 14+ ([download](https://postgresql.org))
- **Git** ([download](https://git-scm.com))

### Instalação Rápida

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/solid-service.git
cd solid-service

# 2. Instalar dependências
npm install

# 3. Configurar banco de dados
cd packages/database
npx prisma migrate dev
npx prisma db seed

# 4. Configurar variáveis de ambiente
cd ../../apps/api
cp .env.example .env
# Editar .env (DATABASE_URL, JWT_SECRET, etc)

# 5. Iniciar backend
npm run dev
```

**API disponível em:** http://localhost:3000
**Swagger docs em:** http://localhost:3000/api/docs

**Credenciais de teste:**
- Email: `admin@example.com`
- Senha: `admin123`

### Setup Completo

Para instruções detalhadas, veja **[SETUP.md](./SETUP.md)**.

---

## 📚 Documentação

### Guias Principais

| Documento | Descrição |
|-----------|-----------|
| **[SETUP.md](./SETUP.md)** | 🔧 Instalação e configuração local completa |
| **[DEPLOY.md](./DEPLOY.md)** | 🚀 Deploy em produção (Railway + Vercel) |
| **[API.md](./API.md)** | 📖 Documentação completa da API REST |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | 🤝 Como contribuir para o projeto |
| **[RBAC.md](./RBAC.md)** | 🔐 Sistema de controle de acesso |

### Documentação Técnica

- **Swagger/OpenAPI**: http://localhost:3000/api/docs (interativo)
- **Prisma Studio**: `npx prisma studio` (explorar banco de dados)
- **E2E Tests**: [apps/api/test/README.md](./apps/api/test/README.md)
- **Performance**: [PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md)
- **Tasks Restantes**: [PLANEJAMENTO_TASKS_RESTANTES.md](./PLANEJAMENTO_TASKS_RESTANTES.md)

---

## 🏗️ Arquitetura

### Multi-tenancy

O sistema utiliza **Row-Level Isolation** com `tenant_id` compartilhado:

```typescript
// Todas as entidades têm tenant_id
model Customer {
  id       String @id @default(uuid())
  tenantId String @map("tenant_id")
  name     String
  // ...

  @@index([tenantId])
}

// Middleware Prisma injeta automaticamente
prisma.$use(async (params, next) => {
  const tenantId = getTenantId();
  if (params.action === 'findMany') {
    params.args.where = { ...params.args.where, tenantId };
  }
  return next(params);
});
```

**Benefícios:**
- ✅ Isolamento total de dados por tenant
- ✅ Custo-efetivo (um banco compartilhado)
- ✅ Performance otimizada (32 índices estratégicos)
- ✅ Testes garantem zero vazamento de dados

**Documentação:** [Plano de Implementação](./docs/planning/implementation-plan.md)

### Backend (6 Módulos)

```
1. Auth         - Registro, login, refresh tokens
2. Customers    - Clientes com contatos/endereços
3. Services     - Catálogo de serviços
4. Quotations   - Orçamentos com workflow de aprovação
5. Service Orders - Ordens com timeline/checklist/anexos
6. Financial    - Recebíveis e pagamentos
+ Dashboard     - Métricas agregadas
+ Audit         - Log de auditoria (admin only)
+ Portal        - Portal público do cliente
```

**Total:** 49 endpoints REST + Swagger completo

### Frontend (Portal Web)

```
- (auth)        - Login, registro de tenant
- (dashboard)   - Sistema interno (CRUD completo)
- (portal)      - Portal do cliente (token-based auth)
```

---

## 🧪 Testes

### Executar Testes

```bash
# Backend - Testes unitários
cd apps/api
npm run test

# Backend - Testes E2E (85+ testes)
npm run test:e2e

# Coverage
npm run test:cov
```

### Suites E2E Implementadas

1. **auth.e2e-spec.ts** - Autenticação completa
2. **customers.e2e-spec.ts** - CRUD + isolamento multi-tenant
3. **quotations-workflow.e2e-spec.ts** - Fluxo orçamento → ordem
4. **financial.e2e-spec.ts** - Recebíveis e pagamentos
5. **attachments.e2e-spec.ts** - Upload S3 + isolamento

**Documentação:** [apps/api/test/README.md](./apps/api/test/README.md)

---

## 🔐 Segurança

### Implementado

- ✅ **JWT** com refresh tokens (15min/7dias)
- ✅ **RBAC** - 4 roles (admin, manager, technician, viewer)
- ✅ **Rate Limiting** - 100 req/min por tenant
- ✅ **Input Validation** - class-validator em todos DTOs
- ✅ **CORS** - Configurado para origens permitidas
- ✅ **Helmet.js** - Security headers
- ✅ **Audit Log** - Rastreamento de ações críticas
- ✅ **Multi-tenant Isolation** - Testado extensivamente

### Boas Práticas

- Nunca expor `.env` ou secrets
- Usar HTTPS em produção
- Rotacionar JWT_SECRET periodicamente
- Backups automáticos do banco
- Monitoramento de logs (Railway/Sentry)

**Documentação:** [RBAC.md](./RBAC.md)

---

## 🚀 Deploy

### Produção (Railway + Vercel)

```bash
# Backend → Railway
# Detecta automaticamente, adiciona PostgreSQL
railway login
railway init
railway up

# Frontend → Vercel
cd apps/web
vercel --prod
```

**Custos estimados (MVP):**
- Railway: $0-5/mês (free tier)
- Vercel: $0 (hobby)
- AWS S3: $0-1/mês
- Resend: $0 (3k emails/mês)
- **Total: $0-6/mês** para MVP

**Guia completo:** [DEPLOY.md](./DEPLOY.md)

---

## 📊 Performance

### Otimizações Implementadas

- ✅ **32 índices estratégicos** no banco (queries 10-13x mais rápidas)
- ✅ **HTTP Compression** (gzip - reduz 85-90% do payload)
- ✅ **Paginação** em todas listagens
- ✅ **Prisma queries otimizadas** (select específico)
- ✅ **Connection pooling** configurado

**Resultados:**
- Queries: 15-50ms (antes: 200-500ms) ⚡
- Payloads: 6-28 KB (antes: 50-200 KB) 📉
- Escalabilidade: Pronto para 10,000+ registros ✅

**Documentação:** [PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md)

---

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia todos apps (backend + frontend)
npm run build            # Build de produção
npm run clean            # Limpa builds e node_modules

# Testes
npm run test             # Testes unitários
npm run test:e2e         # Testes E2E
npm run test:cov         # Coverage

# Code Quality
npm run lint             # ESLint
npm run lint:fix         # Fix automático
npm run format           # Prettier

# Database
cd packages/database
npx prisma generate      # Gerar Prisma Client
npx prisma migrate dev   # Criar/aplicar migration
npx prisma db seed       # Popular dados de teste
npx prisma studio        # Interface visual do banco
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia o **[Guia de Contribuição](./CONTRIBUTING.md)** antes de enviar PRs.

### Como Contribuir

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nome-da-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova feature'`
4. Push para a branch: `git push origin feature/nome-da-feature`
5. Abra um Pull Request

**Leia:** [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🗺️ Roadmap

### MVP (95% completo) ✅

- [x] Multi-tenancy com isolamento completo
- [x] Autenticação JWT + RBAC
- [x] CRUD de clientes, serviços, orçamentos
- [x] Ordens de serviço com workflow
- [x] Financeiro (recebíveis + pagamentos)
- [x] Portal do cliente
- [x] Sistema de notificações por email
- [x] Audit log
- [x] Testes E2E completos
- [x] Otimização de performance
- [x] Documentação completa

### Próximos Passos

- [ ] CI/CD com GitHub Actions
- [ ] Onboarding de cliente piloto
- [ ] Coleta de feedback
- [ ] Iteração baseada em uso real

### Futuro (Pós-MVP)

- [ ] Relatórios avançados
- [ ] Dashboards customizáveis
- [ ] App mobile (React Native)
- [ ] Integrações (WhatsApp, Google Calendar)
- [ ] Multi-idioma (i18n)
- [ ] Temas customizáveis

---

## 📄 Licença

Proprietary - Todos os direitos reservados

---

## 👥 Autores

Desenvolvido com ❤️ por [Seu Nome/Empresa]

---

## 📞 Suporte

- **Issues:** [GitHub Issues](https://github.com/seu-usuario/solid-service/issues)
- **Discussões:** [GitHub Discussions](https://github.com/seu-usuario/solid-service/discussions)
- **Email:** support@solid-service.com

---

## 🙏 Agradecimentos

- [NestJS](https://nestjs.com) - Framework backend incrível
- [Next.js](https://nextjs.org) - Framework frontend moderno
- [Prisma](https://prisma.io) - ORM type-safe
- [Railway](https://railway.app) - Deploy simplificado
- [Vercel](https://vercel.com) - Hosting frontend

---

**Feito com TypeScript + NestJS + Next.js 🚀**
