# ⚡ Início Rápido - Solid Service

## 🎯 Apenas 2 Comandos!

### 1. Setup (primeira vez)
```bash
npm run setup
```

Aguarde 1-2 minutos. Isso vai:
- ✅ Instalar todas as dependências
- ✅ Criar banco de dados SQLite
- ✅ Popular com dados de teste

### 2. Iniciar Servidor
```bash
npm run dev
```

**Pronto!** 🎉

---

## 🌐 Acessar a Aplicação

### Swagger (Testar API)
**http://localhost:3000/api/docs**

### Fazer Login no Swagger

1. Abra http://localhost:3000/api/docs
2. Clique em `POST /api/v1/auth/login`
3. Clique em **"Try it out"**
4. Cole:
   ```json
   {
     "email": "admin@democompany.com",
     "password": "admin123"
   }
   ```
5. Clique em **"Execute"**
6. Copie o `accessToken`

### Autorizar

1. Clique no botão **"Authorize"** 🔓 (topo da página)
2. Cole: `Bearer <seu-token>`
3. Clique em **"Authorize"**

Agora você pode testar todos os endpoints! ✅

---

## 📝 Endpoints Disponíveis

### Autenticação (público)
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Criar novo tenant

### Customers (requer autenticação)
- `GET /api/v1/customers` - Listar clientes
- `GET /api/v1/customers/active` - Listar ativos
- `GET /api/v1/customers/:id` - Buscar por ID
- `POST /api/v1/customers` - Criar cliente
- `PATCH /api/v1/customers/:id` - Atualizar
- `DELETE /api/v1/customers/:id` - Remover (admin)

---

## 👤 Credenciais Demo

**Admin:**
- Email: `admin@democompany.com`
- Senha: `admin123`

**Técnico:**
- Email: `tecnico@democompany.com`
- Senha: `tecnico123`

---

## 🔄 Resetar Banco de Dados

Se quiser começar do zero:

```bash
cd packages/database
npx prisma db push --force-reset
npm run db:seed
cd ../..
```

---

## 🚀 Deploy no Vercel (Frontend + Backend)

### ⚠️ IMPORTANTE sobre Vercel

**Frontend (Next.js):** ✅ Vercel é perfeito!
**Backend (NestJS):** ❌ Vercel não é ideal

**Por quê?**
- Vercel é otimizado para **serverless functions**
- NestJS precisa de um **servidor persistente**
- SQLite não funciona em serverless

### 📌 Opções Recomendadas para Backend:

#### 1. **Railway** (RECOMENDADO - Mais fácil)
- ✅ Grátis para começar
- ✅ Suporta NestJS perfeitamente
- ✅ PostgreSQL incluído
- ✅ Deploy automático via Git

**Como fazer:**
1. Crie conta em https://railway.app
2. Clique em "New Project"
3. Conecte seu GitHub
4. Selecione o repositório
5. Railway detecta NestJS automaticamente
6. Adicione PostgreSQL (clique em "New" → "Database" → "PostgreSQL")
7. Configure variável `DATABASE_URL` automaticamente

#### 2. **Render** (Alternativa grátis)
- ✅ Tier grátis disponível
- ✅ Fácil de usar
- ✅ PostgreSQL incluído

**Como fazer:**
1. Crie conta em https://render.com
2. New → Web Service
3. Conecte GitHub
4. Configure:
   - Build: `npm install && cd packages/database && npx prisma generate && cd ../..`
   - Start: `npm run dev:api`
5. Adicione PostgreSQL (New → PostgreSQL)

#### 3. **Fly.io** (Mais controle)
- ✅ Grátis para 3 apps
- ✅ Deploy via Docker
- ✅ Boa performance

---

## 🌐 Deploy Completo (Recomendação)

### Frontend → Vercel
```bash
# No diretório apps/web (quando criar)
vercel
```

### Backend → Railway
1. Criar projeto no Railway
2. Conectar GitHub
3. Adicionar PostgreSQL
4. Deploy automático

### Resultado:
- Frontend: `https://seu-app.vercel.app`
- API: `https://seu-app.railway.app`

---

## 📦 Para Deploy em Produção

### 1. Trocar SQLite por PostgreSQL

No Railway/Render, você recebe uma URL do PostgreSQL:

**Atualizar schema.prisma:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**No Railway/Render:**
- Eles configuram `DATABASE_URL` automaticamente
- Só fazer push do código

### 2. Rodar Migrations

O Railway/Render executam automaticamente:
```bash
npx prisma migrate deploy
```

---

## 💡 Desenvolvimento Local

**Banco de dados:**
- Desenvolvimento: SQLite (sem Docker)
- Produção: PostgreSQL (Railway/Render)

**Ver dados:**
```bash
cd packages/database
npx prisma studio
```

Abre interface visual em http://localhost:5555

---

## 🛠️ Comandos Úteis

```bash
# Setup inicial (primeira vez)
npm run setup

# Iniciar servidor
npm run dev

# Ver banco de dados
cd packages/database && npx prisma studio

# Resetar banco
cd packages/database && npx prisma db push --force-reset && npm run db:seed

# Build de produção
npm run build
```

---

## 🐛 Problemas?

### "Port 3000 already in use"
Algo está usando a porta 3000. Mude em `.env`:
```
API_PORT=3001
```

### "Cannot find module"
```bash
npm run setup
```

### Erro no Prisma
```bash
cd packages/database
npx prisma generate
npx prisma db push
cd ../..
```

---

## ✅ Checklist

- [ ] Rodou `npm run setup`
- [ ] Rodou `npm run dev`
- [ ] Acessou http://localhost:3000/api/docs
- [ ] Fez login no Swagger
- [ ] Testou listar clientes

---

**Qualquer dúvida, o Swagger tem toda a documentação!** 🚀

http://localhost:3000/api/docs
