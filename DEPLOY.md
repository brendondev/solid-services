# Guia de Deploy - Solid Service

**Versão:** 1.0.0
**Última atualização:** 13/03/2026

---

## 📋 Visão Geral

Este guia cobre o deploy completo da aplicação Solid Service em produção:

- **Backend:** Railway (API + PostgreSQL)
- **Frontend:** Vercel (Next.js)
- **Storage:** AWS S3 (anexos)
- **Email:** Resend (notificações)

**Arquitetura de Produção:**

```
┌─────────────────┐
│  Vercel (Web)   │  ← https://solid-service.vercel.app
│   Next.js 14    │
└────────┬────────┘
         │ API calls
         ↓
┌─────────────────┐
│  Railway (API)  │  ← https://solid-service.up.railway.app
│   NestJS + DB   │
└────────┬────────┘
         │
         ├─→ PostgreSQL (Railway)
         ├─→ AWS S3 (uploads)
         └─→ Resend (emails)
```

---

## 🚂 Deploy Backend (Railway)

### 1. Pré-requisitos

- Conta no Railway: https://railway.app
- Repositório Git configurado
- GitHub/GitLab conectado

### 2. Criar Projeto no Railway

```bash
# Via CLI (opcional)
npm install -g @railway/cli
railway login
railway init
```

**Ou via Dashboard:**
1. Acesse https://railway.app/new
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório `solid-service`

### 3. Adicionar PostgreSQL

No Railway Dashboard:

1. Clique em "+ New Service"
2. Selecione "Database" → "PostgreSQL"
3. Railway cria automaticamente e expõe `DATABASE_URL`

**Verificar variável:**
```bash
railway variables
# Deve aparecer DATABASE_URL
```

### 4. Configurar Variáveis de Ambiente

No Railway Dashboard → Settings → Variables:

```env
# Database (automático do Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT (OBRIGATÓRIO - gerar manualmente)
JWT_SECRET=<gerar-com-crypto-randomBytes>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<outro-secret-aleatorio>
JWT_REFRESH_EXPIRES_IN=7d

# API
NODE_ENV=production
PORT=${{PORT}}

# Frontend URL (após deploy do Vercel)
WEB_URL=https://seu-app.vercel.app

# AWS S3 (opcional mas recomendado)
AWS_ACCESS_KEY_ID=<seu-access-key>
AWS_SECRET_ACCESS_KEY=<seu-secret-key>
AWS_S3_BUCKET=solid-service-prod
AWS_S3_REGION=us-east-1

# Email (Resend - opcional)
RESEND_API_KEY=re_<sua-api-key>
RESEND_FROM_EMAIL=noreply@seudominio.com
```

**Gerar JWT secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Configurar Build

Railway detecta automaticamente o Turborepo, mas precisamos garantir:

**railway.json** (raiz do projeto):

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && cd packages/database && npx prisma generate && cd ../../apps/api && npm run build"
  },
  "deploy": {
    "startCommand": "cd packages/database && npx prisma migrate deploy && cd ../../apps/api && node dist/main.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Ou usar Procfile** (alternativa):

```procfile
web: cd packages/database && npx prisma migrate deploy && cd ../../apps/api && node dist/main.js
```

### 6. Deploy Inicial

```bash
# Via CLI
railway up

# Via Git (automático)
git push origin main
```

**Railway irá:**
1. Detectar monorepo
2. Instalar dependências
3. Gerar Prisma Client
4. Build do backend
5. Executar migrations
6. Iniciar servidor

### 7. Verificar Deploy

```bash
# Ver logs
railway logs

# Testar API
curl https://solid-service.up.railway.app/health
# Deve retornar: {"status":"ok"}

# Testar Swagger
# https://solid-service.up.railway.app/api/docs
```

### 8. Configurar Domínio Customizado (Opcional)

Railway Dashboard → Settings → Domains:

1. Adicionar domínio: `api.seudominio.com`
2. Configurar DNS (CNAME):
   ```
   api.seudominio.com CNAME <railway-app-url>
   ```
3. Railway provisiona SSL automaticamente

---

## ▲ Deploy Frontend (Vercel)

### 1. Pré-requisitos

- Conta no Vercel: https://vercel.com
- GitHub conectado
- Backend no Railway já funcionando

### 2. Criar Projeto no Vercel

**Via Dashboard:**
1. Acesse https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione `solid-service`
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

**Via CLI:**
```bash
npm install -g vercel
cd apps/web
vercel
```

### 3. Configurar Variáveis de Ambiente

Vercel Dashboard → Settings → Environment Variables:

```env
# API Backend (URL do Railway)
NEXT_PUBLIC_API_URL=https://solid-service.up.railway.app/api/v1
NEXT_PUBLIC_API_DOCS_URL=https://solid-service.up.railway.app/api/docs

# Ambiente
NODE_ENV=production
```

### 4. Deploy

```bash
# Via CLI
vercel --prod

# Via Git (automático)
git push origin main
```

**Vercel irá:**
1. Detectar Next.js 14
2. Instalar dependências
3. Build otimizado
4. Deploy em Edge Network

### 5. Verificar Deploy

```bash
# Acessar URL
# https://solid-service.vercel.app

# Testar login
# Usar credenciais do seed ou criar novo tenant
```

### 6. Configurar Domínio Customizado

Vercel Dashboard → Settings → Domains:

1. Adicionar domínio: `app.seudominio.com`
2. Configurar DNS:
   ```
   app.seudominio.com CNAME cname.vercel-dns.com
   ```
3. SSL automático via Let's Encrypt

### 7. Atualizar CORS no Backend

Voltar no Railway e atualizar `WEB_URL`:

```env
WEB_URL=https://seu-app.vercel.app
```

Ou permitir padrão Vercel no código (`apps/api/src/main.ts`):

```typescript
app.enableCors({
  origin: [
    process.env.WEB_URL,
    /\.vercel\.app$/,  // Permite todos subdomínios vercel.app
  ],
  credentials: true,
});
```

---

## 🗄️ Banco de Dados (PostgreSQL)

### Migrations em Produção

**IMPORTANTE:** Migrations são executadas automaticamente no start command (Procfile).

**Executar manualmente via Railway CLI:**

```bash
# Conectar ao projeto
railway link

# Executar migrations
railway run npx prisma migrate deploy

# Ver status
railway run npx prisma migrate status
```

### Seed de Dados Iniciais

**⚠️ NUNCA rode `prisma db seed` em produção!**

Para popular dados iniciais em produção:

1. Criar script separado:

```typescript
// packages/database/prisma/production-seed.ts
async function main() {
  // Criar apenas dados essenciais
  // Exemplo: tenant admin, categorias padrão
}
```

2. Executar manualmente:

```bash
railway run node packages/database/prisma/production-seed.js
```

### Backup e Restore

**Backup via Railway:**

```bash
# Pegar DATABASE_URL
railway variables | grep DATABASE_URL

# Fazer dump
pg_dump <DATABASE_URL> > backup.sql

# Restaurar
psql <DATABASE_URL> < backup.sql
```

**Backup Automatizado:**

Railway Pro tem backups automáticos diários.

### Monitorar Performance

```sql
-- Ver queries lentas (conectar via railway run psql)
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;

-- Ver índices não utilizados
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;
```

---

## ☁️ Storage (AWS S3)

### 1. Criar Bucket S3

```bash
# Via AWS CLI
aws s3 mb s3://solid-service-prod --region us-east-1

# Configurar CORS
aws s3api put-bucket-cors --bucket solid-service-prod --cors-configuration file://cors.json
```

**cors.json:**

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://seu-app.vercel.app"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 2. Criar IAM User

```bash
# Criar usuário
aws iam create-user --user-name solid-service-prod

# Criar policy
aws iam put-user-policy --user-name solid-service-prod \
  --policy-name S3Access --policy-document file://s3-policy.json

# Criar access key
aws iam create-access-key --user-name solid-service-prod
```

**s3-policy.json:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::solid-service-prod/*",
        "arn:aws:s3:::solid-service-prod"
      ]
    }
  ]
}
```

### 3. Configurar no Railway

Adicionar variáveis:

```env
AWS_ACCESS_KEY_ID=<access-key-criado>
AWS_SECRET_ACCESS_KEY=<secret-key-criado>
AWS_S3_BUCKET=solid-service-prod
AWS_S3_REGION=us-east-1
```

### 4. Alternativa: MinIO (Self-hosted)

Para reduzir custos, pode usar MinIO:

```bash
# Deploy MinIO no Railway
railway add minio

# Configurar variáveis
S3_ENDPOINT=https://minio.railway.app
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=solid-service
```

---

## 📧 Email (Resend)

### 1. Criar Conta Resend

1. Acesse https://resend.com
2. Crie conta (free tier: 3k emails/mês)
3. Gere API key

### 2. Adicionar Domínio

Resend Dashboard → Domains → Add Domain:

1. Adicionar: `seudominio.com`
2. Configurar DNS (MX, TXT, CNAME):
   ```
   MX     seudominio.com  →  feedback-smtp.us-east-1.amazonses.com
   TXT    _resend         →  <verification-code>
   CNAME  resend._domainkey → <dkim-key>
   ```
3. Verificar domínio

### 3. Configurar no Railway

```env
RESEND_API_KEY=re_<sua-api-key-aqui>
RESEND_FROM_EMAIL=noreply@seudominio.com
```

### 4. Testar Email

```bash
# Via Railway CLI
railway run curl -X POST http://localhost:3000/api/v1/notifications/test-email

# Ou via Swagger em produção
# https://solid-service.up.railway.app/api/docs
```

---

## 🔐 Segurança em Produção

### Environment Variables

**✅ SEMPRE:**
- Use secrets fortes (32+ caracteres aleatórios)
- Nunca commite `.env` ou `.env.production`
- Rotacione JWT_SECRET periodicamente
- Use diferentes secrets para staging e produção

**Gerar secrets fortes:**

```bash
# JWT_SECRET
openssl rand -base64 32

# JWT_REFRESH_SECRET
openssl rand -base64 32

# Ou via Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### HTTPS & SSL

- ✅ Railway e Vercel fornecem SSL automático
- ✅ Sempre use HTTPS em produção
- ✅ Configure HSTS headers (já configurado via Helmet)

### Rate Limiting

Já configurado no backend (`apps/api/src/main.ts`):

```typescript
// 100 requests por minuto por tenant
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
}));
```

### CORS

Configurar apenas origens permitidas:

```typescript
app.enableCors({
  origin: [
    'https://seu-app.vercel.app',
    'https://app.seudominio.com',
  ],
  credentials: true,
});
```

### Database

- ✅ Use SSL para conexão (Railway já configurado)
- ✅ Nunca exponha DATABASE_URL publicamente
- ✅ Configure backups automáticos (Railway Pro)
- ✅ Limite conexões (Prisma connection pool)

---

## 📊 Monitoramento & Logs

### Railway Logs

```bash
# Ver logs em tempo real
railway logs

# Ver logs específicos
railway logs --filter "ERROR"

# Export logs
railway logs --json > logs.json
```

### Vercel Logs

```bash
# Via CLI
vercel logs <deployment-url>

# Via Dashboard
# https://vercel.com/<seu-projeto>/deployments
```

### Sentry (Erros - Opcional)

**1. Criar conta:** https://sentry.io

**2. Instalar:**

```bash
npm install @sentry/node @sentry/nextjs
```

**3. Configurar Backend:**

```typescript
// apps/api/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**4. Configurar Frontend:**

```typescript
// apps/web/sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Métricas

Railway fornece:
- CPU usage
- Memory usage
- Network I/O
- Request count

**Acessar:** Railway Dashboard → Metrics

---

## 🔄 CI/CD com GitHub Actions

### Workflow Automático

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          JWT_SECRET: test-secret

      - name: Run E2E tests
        run: npm run test:e2e
        working-directory: apps/api

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Secrets do GitHub

GitHub Repo → Settings → Secrets → Actions:

```
RAILWAY_TOKEN=<railway-project-token>
VERCEL_TOKEN=<vercel-token>
VERCEL_ORG_ID=<org-id>
VERCEL_PROJECT_ID=<project-id>
```

---

## 🚀 Deploy Checklist

### Pre-Deploy

- [ ] Testes passando localmente (`npm run test`)
- [ ] E2E tests passando (`npm run test:e2e`)
- [ ] Build funcionando (`npm run build`)
- [ ] Migrations testadas em staging
- [ ] Variáveis de ambiente documentadas
- [ ] Secrets gerados (JWT_SECRET, etc)

### Backend (Railway)

- [ ] Projeto criado no Railway
- [ ] PostgreSQL adicionado
- [ ] Variáveis de ambiente configuradas
- [ ] `railway.json` ou `Procfile` criado
- [ ] Deploy realizado
- [ ] Health check funcionando (`/health`)
- [ ] Swagger acessível (`/api/docs`)
- [ ] Migrations executadas
- [ ] Logs sem erros

### Frontend (Vercel)

- [ ] Projeto criado no Vercel
- [ ] Root directory configurado (`apps/web`)
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] App acessível
- [ ] Login funcionando
- [ ] CORS configurado no backend

### Infra

- [ ] AWS S3 bucket criado
- [ ] IAM user com permissões corretas
- [ ] CORS configurado no S3
- [ ] Resend configurado (opcional)
- [ ] Domínio customizado (opcional)
- [ ] SSL funcionando
- [ ] Backups configurados

### Segurança

- [ ] HTTPS ativo
- [ ] CORS restrito
- [ ] Rate limiting ativo
- [ ] Helmet configurado
- [ ] Secrets fortes e únicos
- [ ] `.env` não commitado

### Monitoring

- [ ] Logs acessíveis
- [ ] Sentry configurado (opcional)
- [ ] Alerts configurados
- [ ] Performance monitorada

---

## 🛠️ Troubleshooting

### Railway: Build Failed

**Erro:** `Build failed`

**Soluções:**
```bash
# Ver logs detalhados
railway logs --build

# Verificar railway.json
cat railway.json

# Testar build localmente
npm run build
```

### Railway: Migrations Failed

**Erro:** `P1017: Server has closed the connection`

**Soluções:**
```bash
# Verificar DATABASE_URL
railway variables | grep DATABASE_URL

# Testar conexão
railway run npx prisma db pull

# Executar migrations manualmente
railway run npx prisma migrate deploy
```

### Vercel: Build Failed

**Erro:** `Next.js build failed`

**Soluções:**
```bash
# Ver logs completos
vercel logs <deployment-url>

# Testar build localmente
cd apps/web && npm run build

# Verificar variáveis de ambiente
vercel env ls
```

### CORS Error

**Erro:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solução:**

1. Verificar `WEB_URL` no Railway
2. Atualizar `main.ts`:

```typescript
app.enableCors({
  origin: ['https://seu-app.vercel.app'],
  credentials: true,
});
```

3. Redeploy backend

### S3 Upload Failed

**Erro:** `AccessDenied: Access Denied`

**Soluções:**
```bash
# Verificar credenciais
railway variables | grep AWS

# Testar IAM permissions
aws s3 ls s3://solid-service-prod \
  --region us-east-1 \
  --profile solid-service

# Verificar bucket policy
aws s3api get-bucket-policy --bucket solid-service-prod
```

---

## 📈 Escalabilidade

### Quando Escalar?

**Indicadores:**
- CPU > 80% constante
- Memory > 90%
- Latência > 500ms
- >1000 tenants ativos

### Estratégias

**1. Vertical Scaling (Railway)**
- Upgrade plan (mais CPU/RAM)
- Railway Dashboard → Settings → Resources

**2. Horizontal Scaling**
- Deploy múltiplas instâncias
- Load balancer (Railway Pro)

**3. Database Optimization**
- Connection pooling (Prisma - já configurado)
- Read replicas (PostgreSQL)
- Índices adicionais

**4. Caching**
- Redis para cache (Railway)
- CDN para assets estáticos (Vercel Edge)

**5. Multi-region**
- Vercel: Edge automático
- Railway: Deploy em múltiplas regiões (Enterprise)

---

## 💰 Custos Estimados

### Free Tier (MVP)

| Serviço | Plano | Custo | Limites |
|---------|-------|-------|---------|
| Railway | Hobby | $0-5/mês | 500h/mês, $5 crédito |
| Vercel | Hobby | $0 | 100 GB bandwidth |
| AWS S3 | Free Tier | $0-1/mês | 5GB storage |
| Resend | Free | $0 | 3,000 emails/mês |
| **TOTAL** | | **$0-6/mês** | MVP até 100 usuários |

### Produção (100-1000 usuários)

| Serviço | Plano | Custo/mês |
|---------|-------|-----------|
| Railway | Pro | $20 |
| Vercel | Pro | $20 |
| AWS S3 | Standard | $5-20 |
| Resend | Starter | $10 |
| **TOTAL** | | **$55-70/mês** |

---

## ✅ Conclusão

Deploy completo realizado! 🚀

**URLs de Produção:**
- API: https://solid-service.up.railway.app
- Docs: https://solid-service.up.railway.app/api/docs
- Web: https://solid-service.vercel.app

**Próximos passos:**
1. Monitorar logs primeiras 24h
2. Configurar alerts
3. Onboarding de clientes piloto
4. Coletar feedback

**Recursos:**
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Production](https://www.prisma.io/docs/guides/deployment)
