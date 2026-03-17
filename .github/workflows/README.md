# GitHub Actions Workflows

Este diretório contém os workflows de CI/CD do projeto Solid Service.

## 📋 Workflows Disponíveis

### 1. CI (Continuous Integration) - `ci.yml`

**Trigger**: Push e Pull Requests para `main` e `develop`

**Jobs executados**:

#### 🔍 Lint & Type Check
- Executa ESLint em todo o código
- Verifica tipos TypeScript sem compilar
- Garante qualidade e consistência do código

#### 🏗️ Build Backend (API)
- Gera Prisma Client
- Compila aplicação NestJS
- Valida que não há erros de TypeScript

#### 🎨 Build Frontend (Web)
- Compila aplicação Next.js
- Gera build estático otimizado
- Valida que todos os componentes podem ser compilados

#### 🧪 Testes Unitários
- Executa Jest nos workspaces
- Gera relatório de cobertura
- Continua mesmo se não houver testes (por enquanto)

#### 🔒 Verificação de Segurança
- Executa `npm audit` para identificar vulnerabilidades
- Verifica dependências de alto risco
- Alertas configurados para continuar build

#### ✅ Validar Schema Prisma
- Valida sintaxe do schema
- Verifica formatação
- Garante integridade do modelo de dados

### 2. Deploy Preview - `deploy-preview.yml`

**Trigger**: Pull Requests para `main`

**Funcionalidade**:
- Verifica build completo antes de merge
- Adiciona comentário no PR com status
- Integra com deploys automáticos do Vercel (frontend) e Railway (backend)

## 🚀 Como Funciona

### Em Pull Requests

1. Desenvolvedor cria PR
2. Workflow `ci.yml` executa todos os checks
3. Workflow `deploy-preview.yml` valida build completo
4. Vercel e Railway criam deploys de preview automaticamente
5. Comentário é adicionado no PR com status
6. Se todos os checks passarem ✅, PR pode ser merged

### Em Push para Main

1. Código é mergeado em `main`
2. Workflow `ci.yml` executa novamente
3. Railway detecta push e faz deploy automático para produção
4. Vercel detecta push e faz deploy automático para produção

## 🔧 Configuração Local

### Executar verificações manualmente:

```bash
# Lint
npm run lint

# Type check
npm run type-check --workspaces

# Build
npm run build

# Testes
npm run test
```

### Simular CI localmente:

```bash
# Instalar dependências
npm ci

# Gerar Prisma Client
cd packages/database && npx prisma generate

# Build completo
cd ../.. && npm run build

# Executar testes
npm run test
```

## 📊 Status Badges

Adicione ao README.md principal:

```markdown
![CI Status](https://github.com/brendondev/solid-services/actions/workflows/ci.yml/badge.svg)
```

## 🛠️ Manutenção

### Adicionar novos checks:

1. Edite `.github/workflows/ci.yml`
2. Adicione novo job ou step
3. Teste localmente primeiro
4. Faça PR com as mudanças

### Modificar triggers:

```yaml
on:
  push:
    branches: [main, develop, staging]  # Adicionar branches
  pull_request:
    types: [opened, synchronize]  # Tipos de eventos
```

## 🎯 Próximos Passos

- [ ] Adicionar testes E2E com Playwright
- [ ] Configurar cache de dependências mais agressivo
- [ ] Adicionar análise de bundle size
- [ ] Implementar deploy automático para staging
- [ ] Adicionar notificações no Slack/Discord

## 📚 Referências

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Next.js CI/CD](https://nextjs.org/docs/deployment)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
