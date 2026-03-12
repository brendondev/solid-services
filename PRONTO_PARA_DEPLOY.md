# ✅ PRONTO PARA DEPLOY NO RAILWAY!

Tudo está configurado. Você só precisa fazer o deploy e adicionar as variáveis de ambiente.

---

## 🚀 PASSOS PARA DEPLOY

### 1. Fazer Commit e Push

```bash
git add .
git commit -m "feat: backend pronto para produção"
git push origin main
```

### 2. Criar Projeto no Railway

**Acesse:** https://railway.app

1. Faça login com GitHub
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha: **brendondev/solid-services**
5. Railway detecta NestJS automaticamente!

### 3. Adicionar PostgreSQL

1. No mesmo projeto, clique em **"New"**
2. Selecione **"Database"**
3. Escolha **"PostgreSQL"**
4. Railway conecta automaticamente!

### 4. Configurar Variáveis de Ambiente

Clique no serviço da API → **Variables** → Adicione:

```env
JWT_SECRET=cole-aqui-uma-string-secreta-qualquer-longa-e-aleatoria
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=production
```

**Dica para JWT_SECRET:**
Use algo como: `meu-super-secret-jwt-2024-solid-service-xyz-123-abc`

### 5. Aguardar Deploy

Railway faz tudo automaticamente (2-3 minutos):
- ✅ npm install
- ✅ Prisma generate
- ✅ Migrations
- ✅ Build
- ✅ Deploy

**URL gerada:** `https://seu-app.up.railway.app`

### 6. Rodar Seed (Popular banco)

**Opção 1: Railway CLI (Recomendado)**

```bash
# Instalar
npm i -g @railway/cli

# Login
railway login

# Conectar ao projeto
railway link

# Rodar seed
railway run npm run db:seed
```

**Opção 2: Via DATABASE_URL**

1. No Railway, clique no PostgreSQL
2. Copie a "PostgreSQL Connection URL"
3. No terminal local:

```bash
DATABASE_URL="postgresql://postgres:senha@host.railway.app:5432/railway" npm run db:seed
```

---

## 🧪 TESTAR

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

### 3. Copiar Token e Autorizar

- Copie o `accessToken`
- Clique em **"Authorize"** 🔓
- Cole: `Bearer <token>`

### 4. Testar Endpoints

- `GET /api/v1/customers`
- `POST /api/v1/customers`

---

## 📋 CHECKLIST

- [ ] Fazer push para GitHub
- [ ] Criar projeto no Railway
- [ ] Deploy from GitHub repo
- [ ] Adicionar PostgreSQL
- [ ] Configurar JWT_SECRET e outras variáveis
- [ ] Aguardar build (2-3 min)
- [ ] Rodar seed no banco
- [ ] Testar no Swagger

---

## 💡 VARIÁVEIS QUE VOCÊ PRECISA ADICIONAR

**Obrigatórias:**
```env
JWT_SECRET=sua-string-secreta-aqui
```

**Opcionais (já tem valores padrão):**
```env
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=production
```

**Automáticas (Railway cria sozinho):**
```env
DATABASE_URL=postgresql://... (Railway adiciona automaticamente)
```

---

## 🎉 PRONTO!

Depois do deploy, sua API estará online em:

**https://seu-app.up.railway.app/api/docs**

Login: `admin@democompany.com` / `admin123`

---

## ❓ PROBLEMAS?

### Erro ao fazer login?
→ Rode o seed no banco (Passo 6 acima)

### Build falhou?
→ Verifique as variáveis de ambiente

### DATABASE_URL não existe?
→ Certifique-se que adicionou PostgreSQL ao projeto

---

**Tudo está pronto! Só fazer o deploy! 🚀**
