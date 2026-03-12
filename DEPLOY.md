# 🚀 Guia de Deploy - Solid Service

## ⚠️ Importante: Vercel NÃO é ideal para backend NestJS

**Por quê?**
- Vercel é otimizado para **serverless functions**
- NestJS precisa de **servidor persistente**
- SQLite não funciona em serverless

**Solução:**
- **Backend**: Railway (recomendado) ou Render
- **Frontend**: Vercel (quando criar o Next.js)

---

## 🎯 Deploy Recomendado: Railway

**Por quê Railway?**
- ✅ Grátis para começar ($5/mês de crédito)
- ✅ Deploy automático via GitHub
- ✅ PostgreSQL grátis incluso
- ✅ Build no servidor (sem problemas com bcrypt)
- ✅ SSL automático
- ✅ Setup em 5 minutos

---

## 📋 Passo a Passo - Railway

### 1. Preparar Repositório GitHub

Seu repositório já está pronto em:
**https://github.com/brendondev/solid-services**

Certifique-se de ter feito push de todo o código:

```bash
git add .
git commit -m "feat: backend completo com multi-tenancy"
git push origin main
```

### 2. Criar Conta no Railway

1. Acesse: **https://railway.app**
2. Clique em **"Start a New Project"**
3. Faça login com GitHub

### 3. Criar Projeto

1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha: **brendondev/solid-services**
4. Railway detecta automaticamente que é NestJS!

### 4. Adicionar PostgreSQL

1. No mesmo projeto, clique em **"New"**
2. Selecione **"Database"**
3. Escolha **"PostgreSQL"**
4. Railway cria automaticamente e conecta!

### 5. Configurar Variáveis de Ambiente

Railway já configura `DATABASE_URL` automaticamente!

Importante:
- `.env` local deve ser usado apenas em desenvolvimento.
- Em produção, `DATABASE_URL` precisa vir do PostgreSQL do Railway e começar com `postgresql://` ou `postgres://`.
- Se o link automático não aparecer, configure manualmente `DATABASE_URL=${{Postgres.DATABASE_URL}}`.

Você só precisa adicionar as outras:

1. Clique no serviço da API
2. Vá em **"Variables"**
3. Adicione:

```env
JWT_SECRET=seu-super-secret-jwt-key-mude-para-algo-seguro
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=production
```

### 6. Configurar Build Commands

Railway detecta automaticamente, mas se precisar ajustar:

**Root Directory:** `/` (raiz do projeto)

**Build Command:**
```bash
npm install && cd packages/database && npx prisma generate && cd ../.. && npm run build
```

**Start Command:**
```bash
cd apps/api && node dist/main.js
```

**Release Command:**
```bash
cd packages/database && npx prisma migrate deploy
```

### 7. Deploy!

Railway faz deploy automático!

Aguarde 2-3 minutos. Você verá:
- ✅ Build successful
- ✅ Deploy successful
- ✅ URL gerada: `https://seu-app.up.railway.app`

---

## 🗄️ Trocar SQLite por PostgreSQL

### 1. Atualizar schema.prisma

Em `packages/database/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Mudou de sqlite
  url      = env("DATABASE_URL")
}
```

### 2. Atualizar tipos incompatíveis

**Reverter Decimal e JSON:**

```prisma
model Tenant {
  settings  Json?    // Mudou de String
  // ...
}

model User {
  roles     String[] @default(["user"])  // Mudou de String
  // ...
}

model Service {
  defaultPrice  Decimal @map("default_price") @db.Decimal(10, 2)
  // ...
}
```

### 3. Fazer commit e push

```bash
git add .
git commit -m "chore: migrate to PostgreSQL for production"
git push origin main
```

Railway faz deploy automático!

---

## 🔗 Conectar com Banco de Dados

### Railway PostgreSQL

Railway cria automaticamente a variável `DATABASE_URL`.

**Ver DATABASE_URL:**

1. No Railway, clique no PostgreSQL
2. Vá em **"Connect"**
3. Copie a **"PostgreSQL Connection URL"**

**Formato:**
```
postgresql://postgres:senha@containers-us-west-123.railway.app:5432/railway
```

### Rodar Migrations

Railway roda automaticamente no build command:
```bash
npx prisma migrate deploy
```

### Seed (Primeira vez)

Conecte no banco e rode:

```bash
# Via Railway CLI (instalar: npm i -g @railway/cli)
railway run npm run db:seed

# Ou conecte via DATABASE_URL local
DATABASE_URL="sua-url-do-railway" npm run db:seed
```

---

## 🧪 Testar Deploy

### 1. Acessar Swagger

```
https://seu-app.up.railway.app/api/docs
```

### 2. Fazer Login

```json
{
  "email": "admin@democompany.com",
  "password": "admin123"
}
```

**Se der erro "user not found":**
- Rode o seed no banco de produção

### 3. Testar Endpoints

Use o Swagger para testar todos endpoints!

---

## 🔄 Deploy Contínuo

Após configurado, cada push no GitHub:

1. Railway detecta automaticamente
2. Faz build
3. Roda migrations
4. Deploy automático
5. URL atualizada

**Simples assim!**

---

## 💰 Custos Railway

**Tier Grátis:**
- $5 de crédito grátis por mês
- PostgreSQL incluso
- SSL incluso
- Suficiente para desenvolvimento e testes

**Se ultrapassar $5:**
- Apenas paga o que usar
- ~$0.02/hora para apps pequenos
- PostgreSQL: ~$5/mês

**Estimativa mensal para MVP:**
- API: ~$2-3
- PostgreSQL: ~$5
- **Total: ~$7-8/mês**

Muito mais barato que VPS tradicional!

---

## 🆘 Troubleshooting

### Build falha no Railway

**Erro:** "bcrypt not found"

**Solução:**
Railway roda em Linux, bcrypt compila automaticamente. Apenas aguarde o build.

### Erro ao rodar migrations

**Erro:** "database doesn't exist"

**Solução:**
Railway cria o banco automaticamente. Verifique se conectou o PostgreSQL ao projeto.

### DATABASE_URL não definida

**Solução:**
1. Certifique-se que adicionou PostgreSQL ao projeto
2. Vá em Variables e verifique se `DATABASE_URL` está lá
3. Se não estiver, defina `DATABASE_URL=${{Postgres.DATABASE_URL}}`
4. Confirme que o valor começa com `postgresql://` ou `postgres://`

### Seed não rodou

**Solução:**
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Fazer login
railway login

# Conectar ao projeto
railway link

# Rodar seed
railway run npm run db:seed
```

---

## 📱 Próximos Passos

### 1. Frontend Next.js no Vercel

Quando criar o frontend:

```bash
cd apps/web
vercel
```

Vercel é perfeito para Next.js!

### 2. Conectar Frontend com Backend

No Vercel, adicione variável de ambiente:

```env
NEXT_PUBLIC_API_URL=https://seu-app.up.railway.app
```

### 3. Deploy Completo

- **Backend**: `https://api.seu-app.com` (Railway)
- **Frontend**: `https://seu-app.com` (Vercel)

---

## 🎉 Pronto!

Seu backend estará online em:
**https://seu-app.up.railway.app**

API Docs:
**https://seu-app.up.railway.app/api/docs**

**Teste agora mesmo!** 🚀

---

## 📋 Checklist Deploy

- [ ] Código no GitHub
- [ ] Criar projeto no Railway
- [ ] Conectar repositório
- [ ] Adicionar PostgreSQL
- [ ] Configurar variáveis de ambiente
- [ ] Aguardar build (2-3 min)
- [ ] Testar URL gerada
- [ ] Rodar seed (se necessário)
- [ ] Testar endpoints no Swagger

---

**Qualquer dúvida, consulte a documentação do Railway:**
https://docs.railway.app
