# Guia de Instalação - Solid Service

**Versão:** 1.0.0
**Última atualização:** 13/03/2026

---

## 📋 Pré-requisitos

### Softwares Obrigatórios

| Software | Versão Mínima | Recomendada | Download |
|----------|---------------|-------------|----------|
| **Node.js** | 18.0.0 | 20.x LTS | https://nodejs.org |
| **npm** | 9.0.0 | 10.x | (incluído no Node.js) |
| **PostgreSQL** | 14.0 | 15.x | https://postgresql.org |
| **Git** | 2.30.0 | Latest | https://git-scm.com |

### Softwares Opcionais (Recomendados)

- **Docker Desktop** - Para rodar PostgreSQL em container
- **Redis** - Para cache e queues (futuro)
- **VSCode** - Editor recomendado com extensões:
  - Prisma
  - ESLint
  - Prettier
  - TypeScript

---

## 🚀 Instalação Local (Desenvolvimento)

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/solid-service.git
cd solid-service
```

### 2. Instalar Dependências

```bash
# Instalar dependências de todos os workspaces
npm install
```

**O que acontece:**
- Turborepo configura o monorepo
- Dependências do backend (apps/api) são instaladas
- Dependências do frontend (apps/web) são instaladas
- Packages compartilhados (database, shared) são linkados

### 3. Configurar Banco de Dados

#### Opção A: PostgreSQL via Docker (Recomendado)

```bash
# Criar container PostgreSQL
docker run --name solid-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=solid_dev \
  -p 5432:5432 \
  -d postgres:15

# Verificar se está rodando
docker ps
```

#### Opção B: PostgreSQL Instalado Localmente

1. Instale o PostgreSQL 15+
2. Crie um banco de dados:

```sql
CREATE DATABASE solid_dev;
CREATE USER solid WITH PASSWORD 'solid123';
GRANT ALL PRIVILEGES ON DATABASE solid_dev TO solid;
```

### 4. Configurar Variáveis de Ambiente

#### Backend (apps/api)

```bash
cd apps/api
cp .env.example .env
```

Edite `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/solid_dev"

# JWT
JWT_SECRET="sua-chave-secreta-super-longa-e-aleatoria-aqui"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="outra-chave-secreta-para-refresh-tokens"
JWT_REFRESH_EXPIRES_IN="7d"

# API
PORT=3000
NODE_ENV=development

# Frontend URL (para CORS)
WEB_URL="http://localhost:3001"

# AWS S3 (opcional para desenvolvimento)
AWS_ACCESS_KEY_ID="seu-access-key"
AWS_SECRET_ACCESS_KEY="seu-secret-key"
AWS_S3_BUCKET="solid-service-dev"
AWS_S3_REGION="us-east-1"

# Email (opcional - Resend)
RESEND_API_KEY="re_sua_api_key_aqui"
RESEND_FROM_EMAIL="onboarding@resend.dev"
```

**⚠️ IMPORTANTE:**
- **NUNCA** commite o arquivo `.env` (já está no .gitignore)
- Use senhas fortes para JWT_SECRET em produção
- Para desenvolvimento, pode usar valores simples

#### Frontend (apps/web)

```bash
cd apps/web
cp .env.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_API_DOCS_URL=http://localhost:3000/api/docs
```

### 5. Executar Migrations do Banco

```bash
# Voltar para a raiz do projeto
cd ../..

# Navegar para o package database
cd packages/database

# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev

# (Opcional) Popular com dados de teste
npx prisma db seed
```

**O que acontece:**
- Prisma cria todas as tabelas no banco
- Prisma Client é gerado com tipos TypeScript
- Seed cria 1 tenant de teste + usuário admin + dados de exemplo

**Credenciais de teste criadas pelo seed:**
- Email: `admin@example.com`
- Senha: `admin123`
- Tenant: `demo-company`

### 6. Iniciar o Backend

```bash
cd ../../apps/api

# Build do projeto
npm run build

# Iniciar em modo desenvolvimento (com hot-reload)
npm run dev
```

**Verificar se funcionou:**
- API rodando em: http://localhost:3000
- Swagger docs em: http://localhost:3000/api/docs
- Health check: http://localhost:3000/health

### 7. Iniciar o Frontend

```bash
# Em outro terminal
cd apps/web

# Iniciar em modo desenvolvimento
npm run dev
```

**Verificar se funcionou:**
- Frontend rodando em: http://localhost:3001
- Login com credenciais de teste (admin@example.com / admin123)

---

## 🧪 Executar Testes

### Testes Backend

```bash
cd apps/api

# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Testes com coverage
npm run test:cov
```

### Testes Frontend (Futuro)

```bash
cd apps/web

# Testes unitários
npm run test

# Testes E2E com Playwright
npm run test:e2e
```

---

## 🛠️ Ferramentas de Desenvolvimento

### Prisma Studio (Explorar Banco de Dados)

```bash
cd packages/database
npx prisma studio
```

Abre interface visual em http://localhost:5555 para explorar os dados.

### Swagger API Docs

Com a API rodando, acesse:
- http://localhost:3000/api/docs

Interface interativa para testar todos os endpoints.

### Logs e Debug

```bash
# Backend com logs detalhados
cd apps/api
npm run start:dev

# Frontend com debug do Next.js
cd apps/web
npm run dev -- --debug
```

---

## 🔧 Solução de Problemas Comuns

### Erro: "Port 3000 already in use"

**Problema:** Porta já está sendo usada por outro processo.

**Solução:**
```bash
# Encontrar processo na porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou mudar a porta no .env
PORT=3001
```

### Erro: "Prisma Client not generated"

**Problema:** Prisma Client não foi gerado.

**Solução:**
```bash
cd packages/database
npx prisma generate
```

### Erro: "Database connection failed"

**Problema:** PostgreSQL não está rodando ou credenciais incorretas.

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
docker ps  # Se usando Docker

# Ou verificar serviço local
pg_isready

# Verificar DATABASE_URL no .env
cat apps/api/.env | grep DATABASE_URL
```

### Erro: "JWT secret not configured"

**Problema:** JWT_SECRET não está definido no .env.

**Solução:**
```bash
# Gerar secret aleatório
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Adicionar no .env
echo "JWT_SECRET=<valor-gerado>" >> apps/api/.env
```

### Erro: "Migration failed"

**Problema:** Migrations com erro ou banco em estado inconsistente.

**Solução:**
```bash
cd packages/database

# Resetar banco (CUIDADO: apaga todos os dados)
npx prisma migrate reset

# Recriar tudo
npx prisma migrate dev
npx prisma db seed
```

### Erro: "Module not found" ou imports quebrados

**Problema:** Path aliases não resolvidos ou cache desatualizado.

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install

# Rebuild
cd apps/api
npm run build
```

### Erro: "CORS blocked"

**Problema:** Frontend não consegue acessar backend.

**Solução:**
```bash
# Verificar WEB_URL no backend .env
# apps/api/.env
WEB_URL="http://localhost:3001"

# Verificar API_URL no frontend .env.local
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## 📁 Estrutura de Diretórios

```
solid-service/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── src/
│   │   │   ├── core/           # Infraestrutura (database, auth, tenant)
│   │   │   ├── modules/        # Módulos de negócio
│   │   │   └── common/         # Guards, decorators, middleware
│   │   ├── test/               # Testes E2E
│   │   └── .env                # Variáveis de ambiente (não commitado)
│   │
│   └── web/                    # Frontend Next.js
│       ├── src/
│       │   ├── app/            # App Router (Next.js 14)
│       │   ├── components/     # Componentes React
│       │   └── lib/            # Utils, hooks, stores
│       └── .env.local          # Variáveis de ambiente (não commitado)
│
├── packages/
│   ├── database/               # Prisma schema, migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Modelo de dados
│   │   │   ├── migrations/     # Migrations versionadas
│   │   │   └── seed.ts         # Dados de teste
│   │   └── package.json
│   │
│   ├── shared/                 # Types compartilhados
│   └── ui/                     # Componentes UI (Shadcn)
│
├── .env.example                # Template de variáveis
├── turbo.json                  # Config do Turborepo
└── package.json                # Workspace root
```

---

## 🔐 Segurança em Desenvolvimento

### Não Commitar Secrets

Arquivos que **NUNCA** devem ser commitados:
- `.env`
- `.env.local`
- `.env.production`
- `*.key`
- `credentials.json`

**Verificar .gitignore:**
```bash
cat .gitignore | grep -E ".env|*.key"
```

### Gerar JWT Secrets Fortes

```bash
# Gerar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Gerar JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Usar HTTPS Localmente (Opcional)

```bash
# Gerar certificado self-signed
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Iniciar com HTTPS
node --require dotenv/config dist/main.js --https --cert cert.pem --key key.pem
```

---

## 🔄 Workflow de Desenvolvimento

### 1. Criar Nova Feature

```bash
# Criar branch
git checkout -b feature/nome-da-feature

# Desenvolver no backend
cd apps/api
# ... código

# Desenvolver no frontend
cd apps/web
# ... código

# Testar
npm run test
npm run test:e2e

# Commit
git add .
git commit -m "feat: descrição da feature"
```

### 2. Atualizar Schema do Banco

```bash
cd packages/database

# Editar schema.prisma
vim prisma/schema.prisma

# Criar migration
npx prisma migrate dev --name nome_da_migration

# Gerar Prisma Client atualizado
npx prisma generate
```

### 3. Adicionar Novo Módulo (Backend)

```bash
cd apps/api

# Gerar módulo (NestJS CLI)
nest g module modules/nome-modulo
nest g controller modules/nome-modulo
nest g service modules/nome-modulo

# Implementar CRUD seguindo padrão existente (ver customers/)
```

### 4. Adicionar Nova Página (Frontend)

```bash
cd apps/web

# Criar rota no App Router
mkdir -p src/app/\(dashboard\)/nome-rota
touch src/app/\(dashboard\)/nome-rota/page.tsx
touch src/app/\(dashboard\)/nome-rota/layout.tsx

# Criar componentes
mkdir -p src/components/nome-rota
```

---

## 📚 Comandos Úteis

### Monorepo

```bash
# Instalar dependência em workspace específico
npm install <package> -w apps/api
npm install <package> -w apps/web

# Rodar script em todos workspaces
npm run build --workspaces

# Limpar tudo e reinstalar
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

### Prisma

```bash
cd packages/database

# Gerar Client
npx prisma generate

# Criar migration
npx prisma migrate dev --name migration_name

# Aplicar migrations em produção
npx prisma migrate deploy

# Resetar banco (DEV ONLY - apaga tudo)
npx prisma migrate reset

# Abrir Prisma Studio
npx prisma studio

# Validar schema
npx prisma validate

# Format schema
npx prisma format
```

### NestJS

```bash
cd apps/api

# Gerar recursos
nest g module modules/nome
nest g controller modules/nome
nest g service modules/nome

# Build
npm run build

# Dev com watch
npm run dev

# Start produção
npm run start:prod
```

### Next.js

```bash
cd apps/web

# Dev
npm run dev

# Build
npm run build

# Start produção
npm run start

# Lint
npm run lint
```

---

## 🎯 Próximos Passos

Após instalação bem-sucedida:

1. **Explorar a API:** http://localhost:3000/api/docs
2. **Login no sistema:** http://localhost:3001 (admin@example.com / admin123)
3. **Ler documentação:**
   - [DEPLOY.md](./DEPLOY.md) - Guia de deploy
   - [API.md](./API.md) - Documentação da API
   - [CONTRIBUTING.md](./CONTRIBUTING.md) - Como contribuir
   - [RBAC.md](./RBAC.md) - Controle de acesso
4. **Estudar código:**
   - Backend: `apps/api/src/modules/customers` (exemplo completo)
   - Frontend: `apps/web/src/app/(dashboard)/customers` (CRUD completo)

---

## 💡 Dicas de Produtividade

### VSCode Settings

Crie `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

### Git Hooks (Husky)

```bash
# Instalar husky
npm install --save-dev husky

# Setup hooks
npx husky install

# Pre-commit: lint + format
npx husky add .husky/pre-commit "npm run lint"

# Pre-push: tests
npx husky add .husky/pre-push "npm run test"
```

### Aliases Úteis

Adicione no `~/.bashrc` ou `~/.zshrc`:

```bash
alias ss-api="cd ~/solid-service/apps/api && npm run dev"
alias ss-web="cd ~/solid-service/apps/web && npm run dev"
alias ss-studio="cd ~/solid-service/packages/database && npx prisma studio"
alias ss-migrate="cd ~/solid-service/packages/database && npx prisma migrate dev"
```

---

## ✅ Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL 14+ instalado/rodando
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] `.env` configurado (backend)
- [ ] `.env.local` configurado (frontend)
- [ ] Migrations executadas (`prisma migrate dev`)
- [ ] Seed executado (`prisma db seed`)
- [ ] Backend rodando (http://localhost:3000)
- [ ] Frontend rodando (http://localhost:3001)
- [ ] Login funcionando (admin@example.com / admin123)
- [ ] Swagger acessível (http://localhost:3000/api/docs)
- [ ] Testes passando (`npm run test`)

---

## 🆘 Precisa de Ajuda?

- **Documentação:** Veja [README.md](./README.md)
- **Issues:** https://github.com/seu-usuario/solid-service/issues
- **Discussões:** https://github.com/seu-usuario/solid-service/discussions

**Setup completo! Bom desenvolvimento! 🚀**
