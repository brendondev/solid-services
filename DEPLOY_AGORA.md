# 🚀 DEPLOY AGORA - 5 MINUTOS

✅ **Código já está no GitHub:** https://github.com/brendondev/solid-services

Agora você só precisa fazer o deploy no Railway!

---

## 📱 PASSOS (5 minutos):

### 1️⃣ Acessar Railway

**Link direto:** https://railway.app/new

### 2️⃣ Login com GitHub

Clique em **"Login with GitHub"**

### 3️⃣ Deploy from GitHub

1. Clique em **"Deploy from GitHub repo"**
2. Procure: **solid-services**
3. Clique em **"Deploy Now"**

Railway detecta automaticamente o NestJS! ✅

### 4️⃣ Adicionar PostgreSQL

1. No projeto, clique em **"+ New"**
2. Selecione **"Database"**
3. Clique em **"Add PostgreSQL"**

Railway conecta automaticamente! ✅

### 5️⃣ Adicionar Variável de Ambiente

1. Clique no serviço da **API** (não no PostgreSQL)
2. Vá em **"Variables"**
3. Clique em **"+ New Variable"**
4. Adicione:

**Name:** `JWT_SECRET`
**Value:** `solid-service-jwt-secret-2024-prod-xyz-abc-123`

(Pode mudar para qualquer string longa e aleatória)

### 6️⃣ Aguardar Deploy (2-3 minutos)

Railway vai:
- ✅ Install dependencies
- ✅ Generate Prisma
- ✅ Run migrations
- ✅ Build
- ✅ Deploy

**URL será gerada:** `https://solid-services-production.up.railway.app`

### 7️⃣ Rodar Seed (Popular banco)

**Opção A: Railway CLI**
```bash
npm i -g @railway/cli
railway login
railway link
railway run npm run db:seed
```

**Opção B: Via URL no terminal**

1. No Railway, clique no **PostgreSQL**
2. Vá em **"Connect"** → **"PostgreSQL Connection URL"**
3. Copie a URL
4. No terminal:

```bash
cd C:\Users\blima\Desktop\Documentos\solid-service
DATABASE_URL="cole-a-url-aqui" npm run db:seed
```

---

## 🧪 TESTAR

Após o deploy (2-3 min), acesse:

**Swagger:** `https://seu-app.up.railway.app/api/docs`

### Login:
```json
{
  "email": "admin@democompany.com",
  "password": "admin123"
}
```

1. Copie o `accessToken`
2. Clique em **"Authorize"** 🔓
3. Cole: `Bearer <token>`
4. Teste os endpoints!

---

## 📋 CHECKLIST

- [x] ✅ Código no GitHub
- [ ] Login no Railway
- [ ] Deploy from GitHub repo (solid-services)
- [ ] Adicionar PostgreSQL
- [ ] Adicionar JWT_SECRET
- [ ] Aguardar build (2-3 min)
- [ ] Rodar seed
- [ ] Testar no Swagger

---

## 🎯 LINKS IMPORTANTES

- **GitHub:** https://github.com/brendondev/solid-services
- **Railway:** https://railway.app/new
- **Documentação:** Ver DEPLOY.md

---

## ❓ PROBLEMAS?

### Não encontro o repositório no Railway?
→ Certifique-se que está logado com a conta GitHub correta (brendondev)

### Build falhou?
→ Verifique se adicionou a variável JWT_SECRET

### Erro ao fazer login na API?
→ Você precisa rodar o seed no banco (Passo 7)

---

**É SÓ ISSO! Deploy leva 5 minutos! 🚀**
