# Solid Service - ERP SaaS Multi-tenant

Sistema ERP multi-tenant para prestadores de serviços (MEIs, autônomos e pequenas empresas).

## 🚀 Stack Tecnológica

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL 15+ com Prisma ORM
- **Cache/Queue**: Redis + BullMQ
- **Storage**: MinIO (S3-compatible)
- **Auth**: JWT + Refresh Tokens

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **State**: React Query + Zustand
- **UI**: Shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod

### DevOps
- **Monorepo**: Turborepo
- **CI/CD**: GitHub Actions
- **Hosting**: Railway/Render (backend), Vercel (frontend)

## 📁 Estrutura do Projeto

```
solid-service/
├── apps/
│   ├── api/          # Backend NestJS
│   └── web/          # Frontend Next.js
├── packages/
│   ├── database/     # Prisma schema, migrations
│   ├── shared/       # Types, utils compartilhados
│   └── ui/           # Componentes UI (Shadcn)
├── docs/             # Documentação
├── docker/           # Docker Compose
└── package.json      # Workspace root
```

## 🛠️ Setup de Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm 9+
- Docker e Docker Compose
- Git

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd solid-service
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite .env com suas configurações
```

4. Inicie os serviços com Docker:
```bash
docker-compose up -d
```

5. Execute as migrations do banco:
```bash
cd packages/database
npx prisma migrate dev
npx prisma db seed
```

6. Inicie o ambiente de desenvolvimento:
```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`
O frontend estará disponível em `http://localhost:3001`

## 📚 Documentação

- [Plano de Implementação](./docs/planning/implementation-plan.md)
- [Documentação da API](http://localhost:3000/api/docs) (Swagger)
- [Arquitetura](./docs/architecture/)

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Coverage
npm run test:cov
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia todos os apps em modo desenvolvimento
- `npm run build` - Build de produção
- `npm run test` - Executa testes
- `npm run lint` - Lint dos arquivos
- `npm run format` - Formata código com Prettier
- `npm run clean` - Limpa builds e node_modules

## 🏗️ Arquitetura Multi-tenant

O sistema utiliza **Row-Level Isolation** com `tenant_id` compartilhado:

- Cada entidade possui um campo `tenantId`
- Middleware Prisma injeta automaticamente o filtro
- AsyncLocalStorage mantém o contexto do tenant
- Testes automatizados garantem isolamento

## 🔐 Segurança

- JWT com refresh tokens
- Rate limiting por tenant
- Input validation (class-validator)
- CORS configurado
- Helmet.js para security headers
- Secrets gerenciados via variáveis de ambiente

## 📄 Licença

Proprietary - Todos os direitos reservados

## 👥 Autores

Desenvolvido por [Seu Nome/Empresa]
