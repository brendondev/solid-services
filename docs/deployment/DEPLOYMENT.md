# 🚀 Guia de Deploy - Solid Service

## Índice
- [Railway (Backend)](#railway-backend)
- [Vercel (Frontend)](#vercel-frontend)
- [Configuração S3](#configuração-s3)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Checklist Pré-Deploy](#checklist-pré-deploy)

## Railway (Backend)

### 1. Criar Projeto

1. Acesse https://railway.app
2. **New Project** → **Deploy from GitHub**
3. Selecione o repositório `solid-services`
4. Railway detectará automaticamente o monorepo

### 2. Configurar Service da API

**Root Directory**: `apps/api`
**Build Command**: `npm run build`
**Start Command**: `node dist/main`

### 3. Adicionar PostgreSQL

1. **+ New** → **Database** → **PostgreSQL**
2. Railway criará `DATABASE_URL` automaticamente
3. Conecte ao service da API

### 4. Variáveis de Ambiente

Adicione no service da **API**:

```env
# Automáticas (Railway cria)
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=${{PORT}}

# Manuais (você adiciona)
JWT_SECRET=gerar-um-secret-longo-e-aleatorio
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=production

# S3 (opcional - Railway pode criar automaticamente)
AWS_ENDPOINT_URL=${{recorded-tupperware.ENDPOINT}}
AWS_DEFAULT_REGION=${{recorded-tupperware.REGION}}
AWS_S3_BUCKET_NAME=${{recorded-tupperware.BUCKET}}
AWS_ACCESS_KEY_ID=${{recorded-tupperware.ACCESS_KEY_ID}}
AWS_SECRET_ACCESS_KEY=${{recorded-tupperware.SECRET_ACCESS_KEY}}
```

### 5. Configurar Migrations

Crie `Procfile` na raiz:

```
web: cd packages/database && npx prisma migrate deploy && cd ../../apps/api && node dist/main.js
```

### 6. Deploy

```bash
git push origin main
```

Railway fará deploy automaticamente!

**URL da API**: `https://solid-services-production.up.railway.app`

## Vercel (Frontend)

### 1. Importar Projeto

1. Acesse https://vercel.com
2. **Add New** → **Project**
3. Importe `solid-services` do GitHub

### 2. Configurar Build

**Framework Preset**: Next.js
**Root Directory**: `apps/web`
**Build Command**: `npm run build`
**Output Directory**: `.next`

### 3. Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=https://solid-services-production.up.railway.app/api/v1
NEXT_PUBLIC_BASE_URL=https://solid-services-web.vercel.app
```

### 4. Deploy

Vercel fará deploy automaticamente em cada push!

**URL do Frontend**: `https://solid-services-web.vercel.app`

## Configuração S3

### Opção A: Railway Storage (Automático)

Railway pode criar um bucket S3 automaticamente:
1. **+ New** → **Storage** → **S3 Compatible**
2. Conecte ao service da API
3. Variáveis `AWS_*` serão criadas automaticamente

### Opção B: Turso T3 (Manual)

1. Acesse https://t3.storageapi.dev
2. Crie um bucket
3. Copie as credenciais
4. Adicione no Railway:

```env
S3_ENDPOINT=https://t3.storageapi.dev
S3_REGION=us-east-1
S3_BUCKET=seu-bucket
S3_ACCESS_KEY_ID=tid_xxx
S3_SECRET_ACCESS_KEY=tsec_xxx
```

**Nota**: O sistema suporta AMBOS `S3_*` e `AWS_*` prefixos.

### Opção C: Sem S3 (Storage Local)

Se não configurar S3, o sistema usa filesystem local:
- ✅ Funciona imediatamente
- ⚠️ Arquivos perdidos ao reiniciar
- ⚠️ Não recomendado para produção

## Variáveis de Ambiente

### Railway (Backend)

| Variável | Obrigatória | Exemplo | Descrição |
|----------|-------------|---------|-----------|
| `DATABASE_URL` | ✅ | Auto | URL do PostgreSQL |
| `JWT_SECRET` | ✅ | string longa | Secret para JWT |
| `PORT` | ✅ | Auto | Porta do servidor |
| `NODE_ENV` | ✅ | production | Ambiente |
| `S3_ENDPOINT` | ❌ | https://t3... | Endpoint S3 |
| `S3_REGION` | ❌ | us-east-1 | Região S3 |
| `S3_BUCKET` | ❌ | meu-bucket | Nome do bucket |
| `S3_ACCESS_KEY_ID` | ❌ | tid_xxx | Access Key |
| `S3_SECRET_ACCESS_KEY` | ❌ | tsec_xxx | Secret Key |

### Vercel (Frontend)

| Variável | Obrigatória | Exemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | https://api.../api/v1 |
| `NEXT_PUBLIC_BASE_URL` | ✅ | https://app... |

## Checklist Pré-Deploy

### Backend (Railway)

- [ ] PostgreSQL adicionado e conectado
- [ ] Todas variáveis de ambiente configuradas
- [ ] `JWT_SECRET` gerado (mínimo 32 caracteres)
- [ ] Procfile criado para migrations
- [ ] Build local passa: `npm run build`
- [ ] Migrations testadas: `npx prisma migrate deploy`

### Frontend (Vercel)

- [ ] Root directory: `apps/web`
- [ ] `NEXT_PUBLIC_API_URL` aponta para Railway
- [ ] Build local passa: `npm run build`
- [ ] Variáveis de ambiente configuradas

### S3 (Opcional)

- [ ] Bucket criado
- [ ] Credenciais copiadas
- [ ] Variáveis adicionadas no Railway
- [ ] Região correta (us-east-1)
- [ ] Teste de upload funcionando

## Verificação Pós-Deploy

### 1. Health Check

```bash
# Backend
curl https://solid-services-production.up.railway.app

# Deve retornar: {"status":"ok"}
```

### 2. Swagger Docs

```
https://solid-services-production.up.railway.app/api/docs
```

### 3. Frontend

```
https://solid-services-web.vercel.app
```

### 4. Teste de Login

```
Email: admin@demo.com (se seed rodou)
Senha: admin123
```

### 5. Logs

**Railway**:
- Verifique logs de inicialização
- Procure por erros de migration
- Confirme: "Storage inicializado..."

**Vercel**:
- Verifique build logs
- Confirme deploy bem-sucedido

## Problemas Comuns

### Migration Falha no Deploy

**Solução**:
```bash
# Localmente
cd packages/database
npx prisma migrate deploy

# Commite o schema atualizado
git add -A
git commit -m "fix: update schema"
git push
```

### Frontend não conecta ao Backend

**Verifique**:
- `NEXT_PUBLIC_API_URL` está correto?
- Railway está rodando?
- CORS configurado? (deve estar)

### Upload de Arquivos Falha

**Verifique**:
- Variáveis S3 configuradas?
- Logs mostram "Storage inicializado: MinIO"?
- Se não, usa storage local (ok para teste)

### Erro 500 Genérico

**Debug**:
1. Veja logs do Railway
2. Verifique `DATABASE_URL`
3. Confirme que migrations rodaram
4. Teste seed: `npx prisma db seed`

## Atualizações

### Deploy Automático

Ambos Railway e Vercel fazem deploy automático em:
```bash
git push origin main
```

### Deploy Manual

**Railway**:
1. Service → ⋮ → Redeploy

**Vercel**:
1. Project → Deployments → ⋮ → Redeploy

## Rollback

### Railway

1. Deployments → Deployment anterior
2. ⋮ → Redeploy

### Vercel

1. Deployments → Deployment anterior
2. ⋮ → Promote to Production

## Monitoramento

- 📊 Railway Dashboard para métricas
- 📈 Vercel Analytics para frontend
- 🐛 Sentry (opcional) para erros

## Custos Estimados

**Railway** (Backend + PostgreSQL):
- Free tier: $5 crédito/mês
- Hobby: $5-20/mês
- Pro: $20+/mês

**Vercel** (Frontend):
- Hobby: Grátis
- Pro: $20/mês

**S3/T3**:
- Pay-as-you-go
- ~$0.023/GB/mês
- + transferência

## Suporte

- 🐛 Issues: https://github.com/brendondev/solid-services/issues
- 📚 Docs: https://docs.railway.app
- 💬 Discord: https://discord.gg/railway
