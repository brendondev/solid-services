# 🚀 Guia de Início Rápido - Solid Service

## Índice
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Primeiro Acesso](#primeiro-acesso)
- [Próximos Passos](#próximos-passos)

## Pré-requisitos

- **Node.js** 18+ (recomendado: 20+)
- **npm** 9+
- **Git**

## Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/brendondev/solid-services.git
cd solid-services
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Banco de Dados

```bash
# Entre na pasta do database
cd packages/database

# Execute as migrations
npx prisma migrate dev

# Popule com dados de exemplo
npx prisma db seed

# Volte para a raiz
cd ../..
```

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/solid_service"

# JWT
JWT_SECRET="sua-chave-secreta-super-longa-e-aleatoria"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Servidor
NODE_ENV="development"
PORT=3000

# S3 (Opcional - usa local storage se não configurado)
S3_ENDPOINT=https://t3.storageapi.dev
S3_REGION=us-east-1
S3_BUCKET=seu-bucket
S3_ACCESS_KEY_ID=sua-key
S3_SECRET_ACCESS_KEY=seu-secret
```

### 2. PostgreSQL

**Opção A: Local**
```bash
# Instale PostgreSQL
# Crie o banco:
createdb solid_service
```

**Opção B: Docker**
```bash
docker-compose up -d postgres
```

## Primeiro Acesso

### 1. Inicie o Backend

```bash
npm run dev:api
```

O servidor estará em: `http://localhost:3000`

### 2. Inicie o Frontend (em outro terminal)

```bash
cd apps/web
npm run dev
```

O frontend estará em: `http://localhost:3001`

### 3. Acesse o Sistema

```
URL: http://localhost:3001
Email: admin@demo.com
Senha: admin123
```

### 4. Dados de Exemplo

O seed criou:
- 1 Tenant (empresa demo)
- 1 Admin user
- 5 Clientes
- 3 Serviços
- 2 Orçamentos
- 1 Ordem de Serviço

## Próximos Passos

- 📚 Leia a [Documentação da API](./development/API.md)
- 🎨 Veja o [Design System](./development/DESIGN_SYSTEM.md)
- 🚀 Configure [Deploy em Produção](./deployment/DEPLOYMENT.md)
- 🔐 Entenda [RBAC e Permissões](./development/RBAC.md)

## Problemas Comuns

### Erro de Conexão com Banco

```bash
# Verifique se o PostgreSQL está rodando
pg_isready

# Verifique a DATABASE_URL no .env
```

### Porta já em uso

```bash
# Backend (porta 3000)
lsof -ti:3000 | xargs kill -9

# Frontend (porta 3001)
lsof -ti:3001 | xargs kill -9
```

### Prisma Client desatualizado

```bash
cd packages/database
npx prisma generate
```

## Comandos Úteis

```bash
# Build completo
npm run build

# Lint
npm run lint

# Testes
npm run test

# Limpar tudo
npm run clean
```

## Estrutura do Projeto

```
solid-service/
├── apps/
│   ├── api/          # Backend NestJS
│   └── web/          # Frontend Next.js
├── packages/
│   └── database/     # Prisma + Migrations
├── docs/             # Documentação
└── .github/          # CI/CD
```

## Suporte

- 📖 [Documentação Completa](../README.md)
- 🐛 [Reportar Bug](https://github.com/brendondev/solid-services/issues)
- 💬 [Discussões](https://github.com/brendondev/solid-services/discussions)
