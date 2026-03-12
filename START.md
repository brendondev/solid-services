# 🚀 START - Solid Service

## ✅ Tudo Está Pronto!

O projeto já está configurado e pronto para usar. Eu fiz todo o setup para você!

---

## ⚡ Como Iniciar (1 comando!)

```bash
npm run dev
```

**Aguarde 10-15 segundos** até ver:
```
🚀 API running on: http://localhost:3000
📚 API docs: http://localhost:3000/api/docs
```

**Pronto!** Acesse: http://localhost:3000/api/docs

---

## 🎯 Testar Agora

### 1. Abra o Swagger
http://localhost:3000/api/docs

### 2. Faça Login

- Clique em `POST /api/v1/auth/login`
- Clique em **"Try it out"**
- Cole:

```json
{
  "email": "admin@democompany.com",
  "password": "admin123"
}
```

- Clique em **"Execute"**
- **Copie o `accessToken`**

### 3. Autorize

- Clique no botão **"Authorize"** 🔓 (topo da página)
- Cole: `Bearer <cole-o-token-aqui>`
- Clique em **"Authorize"**
- Clique em **"Close"**

### 4. Teste os Endpoints

Agora teste qualquer endpoint! Exemplos:

- `GET /api/v1/customers` - Ver clientes
- `POST /api/v1/customers` - Criar cliente
- `GET /api/v1/customers/{id}` - Ver detalhes

---

## 👤 Credenciais

**Admin:**
- Email: `admin@democompany.com`
- Senha: `admin123`

**Técnico:**
- Email: `tecnico@democompany.com`
- Senha: `tecnico123`

---

## 📦 O Que Já Está Pronto

✅ Backend NestJS funcionando
✅ Banco de dados SQLite (sem Docker!)
✅ Autenticação JWT
✅ Módulo de Customers completo
✅ Multi-tenancy seguro
✅ Swagger docs interativo
✅ Dados demo carregados

---

## 🌐 Deploy Online (Vercel?)

### ⚠️ Importante sobre Vercel

**Frontend:** ✅ Vercel é perfeito!
**Backend:** ❌ Vercel NÃO é ideal para NestJS

### Por quê?

Vercel é para **serverless functions**. NestJS precisa de **servidor persistente**.

### ✅ Opções Recomendadas para Backend:

#### 1. **Railway** (RECOMENDADO)

**Melhor escolha para NestJS!**

- ✅ Grátis para começar
- ✅ Deploy automático via GitHub
- ✅ PostgreSQL incluído grátis
- ✅ Setup em 2 minutos

**Como fazer:**

1. Crie conta: https://railway.app
2. New Project → Deploy from GitHub
3. Selecione seu repositório
4. Railway detecta NestJS automaticamente
5. Adicione PostgreSQL (New → Database → PostgreSQL)
6. Pronto! URL gerada automaticamente

**Custo:** Grátis até $5/mês de uso

#### 2. **Render** (Alternativa grátis)

- ✅ Tier grátis disponível
- ✅ PostgreSQL grátis incluso
- ✅ SSL automático

**Como fazer:**

1. Crie conta: https://render.com
2. New → Web Service
3. Conecte GitHub
4. Configure:
   - Build: `npm install && cd packages/database && npx prisma generate`
   - Start: `npm run dev:api`
5. Adicione PostgreSQL (New → PostgreSQL)

**Custo:** Grátis (dorme após inatividade)

#### 3. **Fly.io** (Mais controle)

- ✅ Grátis para 3 apps
- ✅ Deploy via Docker
- ✅ PostgreSQL disponível

---

## 🏗️ Deploy Completo

**Recomendação:**

- **Frontend** (Next.js quando criar): Vercel
- **Backend** (NestJS): Railway
- **Database**: PostgreSQL do Railway

**Resultado:**
- Frontend: `https://seu-app.vercel.app`
- API: `https://seu-app.railway.app`

---

## 🛠️ Comandos Úteis

```bash
# Iniciar servidor
npm run dev

# Ver banco de dados (visual)
cd packages/database && npx prisma studio

# Resetar banco de dados
cd packages/database && npx prisma db push --force-reset && npm run db:seed

# Build de produção
npm run build
```

---

## 📂 Ver Dados Visualmente

```bash
cd packages/database
npx prisma studio
```

Abre em: http://localhost:5555

Você pode ver/editar todos os dados!

---

## 🔧 Trocar para PostgreSQL (Produção)

Quando for fazer deploy, você vai receber um DATABASE_URL do Railway/Render.

**No schema.prisma:**

```prisma
datasource db {
  provider = "postgresql"  // Mude de sqlite
  url      = env("DATABASE_URL")
}
```

**No Railway/Render:**
- Eles configuram DATABASE_URL automaticamente
- Apenas faça push do código

---

## ❓ Problemas?

### Port 3000 ocupada?

Mude em `.env`:
```
API_PORT=3001
```

### Erro ao iniciar?

```bash
npm install
cd packages/database && npx prisma generate
cd ../..
npm run dev
```

### Resetar tudo?

```bash
cd packages/database
npx prisma db push --force-reset
npm run db:seed
cd ../..
```

---

## 📚 Documentação

- **Início Rápido**: [INICIO_RAPIDO.md](./INICIO_RAPIDO.md)
- **Como Rodar**: [COMO_RODAR.md](./COMO_RODAR.md)
- **Progresso**: [PROGRESS.md](./PROGRESS.md)
- **README**: [README.md](./README.md)

---

## 🎉 Tudo Pronto!

Apenas rode:

```bash
npm run dev
```

E acesse: http://localhost:3000/api/docs

**Divirta-se!** 🚀
