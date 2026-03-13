# ✅ Checklist de Deploy - Solid Service

**Data:** 13/03/2026
**Status:** Pronto para deploy! 🚀

---

## ✅ Pré-Deploy (Completo)

- [x] Código commitado e pushed para GitHub
- [x] `railway.json` e `Procfile` configurados
- [x] Documentação completa criada
- [x] MVP 97.4% implementado (38/39 tasks)
- [x] Testes E2E implementados
- [x] Performance otimizada

---

## 🚂 Deploy Backend (Railway)

### 1. Criar Projeto Railway

1. Acesse: **https://railway.app**
2. Login com GitHub
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Escolha: **brendondev/solid-services**
6. Railway detecta automaticamente!

### 2. Adicionar PostgreSQL

1. No projeto Railway, clique **"+ New"**
2. Selecione **"Database"** → **"PostgreSQL"**
3. Railway cria e conecta automaticamente
4. `DATABASE_URL` estará disponível automaticamente

### 3. Configurar Variáveis de Ambiente

**IMPORTANTE:** Vá em Settings → Variables e adicione:

#### JWT Secrets (OBRIGATÓRIO)

Execute no terminal local para gerar:

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT_REFRESH_SECRET (rodar novamente)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Adicione no Railway:

```env
JWT_SECRET=<valor-gerado-1>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<valor-gerado-2>
REFRESH_TOKEN_EXPIRES_IN=7d
```

#### Outras Variáveis

```env
# API
NODE_ENV=production
PORT=${{PORT}}

# Frontend (deixar em branco por agora, adicionar depois)
WEB_URL=

# AWS S3 (OPCIONAL - pode deixar vazio)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_S3_REGION=us-east-1

# Email - Resend (OPCIONAL)
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

### 4. Deploy Automático

Railway faz deploy automaticamente após conectar repo!

**Aguarde 3-5 minutos.** Railway irá:
1. ✅ Instalar dependências
2. ✅ Gerar Prisma Client
3. ✅ Build do NestJS
4. ✅ Executar migrations
5. ✅ Iniciar servidor

### 5. Verificar Deploy

Após deploy bem-sucedido, pegue a URL gerada (ex: `solid-services-production.up.railway.app`)

**Testar:**

```bash
# Health check
curl https://SEU-APP.up.railway.app/health

# Deve retornar: {"status":"ok"}
```

**Swagger:**
- Acesse: `https://SEU-APP.up.railway.app/api/docs`

### 6. Testar Autenticação

**Registrar primeiro tenant:**

```bash
curl -X POST https://SEU-APP.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Empresa Teste",
    "tenantSlug": "empresa-teste",
    "adminName": "Admin",
    "adminEmail": "admin@teste.com",
    "password": "Senha@123"
  }'
```

**Login:**

```bash
curl -X POST https://SEU-APP.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@teste.com",
    "password": "Senha@123"
  }'
```

---

## 📊 Ver Logs (se houver erro)

### Via Railway Dashboard

1. Clique no serviço da API
2. Aba **"Deployments"**
3. Ver logs em tempo real

### Via Railway CLI

```bash
# Instalar
npm install -g @railway/cli

# Login
railway login

# Conectar ao projeto
railway link

# Ver logs
railway logs
```

---

## ⚠️ Troubleshooting Comum

### Erro: Build Failed

**Solução:**
1. Ver logs no Railway Dashboard
2. Verificar se `railway.json` está correto
3. Testar build local: `npm run build`

### Erro: Migrations Failed

**Solução:**
1. Verificar se PostgreSQL está conectado
2. Ver variável `DATABASE_URL` no Railway
3. Executar manualmente:
   ```bash
   railway run npx prisma migrate deploy
   ```

### Erro: JWT_SECRET not defined

**Solução:**
1. Gerar secrets com comando acima
2. Adicionar no Railway → Settings → Variables
3. Redeploy (automático após salvar variáveis)

### Erro: Module not found

**Solução:**
1. Limpar build cache no Railway
2. Settings → General → "Clear Build Cache"
3. Redeploy

---

## ▲ Deploy Frontend (Vercel) - OPCIONAL

Se quiser fazer deploy do frontend também:

### 1. Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
cd apps/web
vercel --prod
```

### 2. Via Dashboard

1. Acesse: **https://vercel.com/new**
2. Import Git Repository → Selecione **brendondev/solid-services**
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

4. Environment Variables:
   ```env
   NEXT_PUBLIC_API_URL=https://SEU-APP.up.railway.app/api/v1
   NEXT_PUBLIC_API_DOCS_URL=https://SEU-APP.up.railway.app/api/docs
   NODE_ENV=production
   ```

5. Deploy!

### 3. Atualizar CORS no Backend

Após deploy do frontend, volte no Railway e adicione:

```env
WEB_URL=https://seu-app.vercel.app
```

---

## 🎯 URLs de Produção

Após deploy completo:

- **API Backend:** `https://SEU-APP.up.railway.app`
- **API Docs (Swagger):** `https://SEU-APP.up.railway.app/api/docs`
- **Frontend Web:** `https://seu-app.vercel.app` (se fizer deploy)

---

## 💰 Custos Estimados

### Free Tier (Primeiros meses)

- Railway: $0-5/mês (free tier com $5 de crédito)
- Vercel: $0 (hobby plan)
- **Total: ~$0-5/mês**

Suficiente para MVP e primeiros clientes!

---

## ✅ Checklist Final

### Backend (Railway)

- [ ] Projeto criado
- [ ] GitHub repo conectado
- [ ] PostgreSQL adicionado
- [ ] JWT_SECRET configurado
- [ ] JWT_REFRESH_SECRET configurado
- [ ] Deploy bem-sucedido
- [ ] Health check funciona (`/health`)
- [ ] Swagger acessível (`/api/docs`)
- [ ] Registro de tenant funciona
- [ ] Login funciona

### Frontend (Vercel) - Opcional

- [ ] Projeto criado
- [ ] Root directory: `apps/web`
- [ ] Environment variables configuradas
- [ ] Deploy bem-sucedido
- [ ] App acessível
- [ ] WEB_URL atualizado no Railway

---

## 🆘 Precisa de Ajuda?

Se encontrar algum erro:

1. **Copie o log completo do erro**
2. **Screenshot do erro (se houver)**
3. **Qual passo estava executando**
4. **Me envie essas informações**

Estou aqui para resolver! 💪

---

**Boa sorte com o deploy! 🚀**
