# 🚀 DEPLOY PRONTO - Railway

✅ **Build testado e funcionando!**
✅ **Código no GitHub:** https://github.com/brendondev/solid-services
✅ **Configurações prontas** (railway.json, Procfile, .env.example)

---

## 📋 PASSOS PARA DEPLOY (5 MINUTOS)

### 1️⃣ Acessar Railway e Fazer Login

🔗 **Link:** https://railway.app/new

- Clique em **"Login with GitHub"**
- Autorize o Railway a acessar seus repositórios

---

### 2️⃣ Criar Novo Projeto

1. No Railway, clique em **"Deploy from GitHub repo"**
2. Procure e selecione: **brendondev/solid-services**
3. Clique em **"Deploy Now"**

**✅ Railway detecta NestJS automaticamente!**

---

### 3️⃣ Adicionar PostgreSQL

1. No mesmo projeto (dashboard), clique em **"+ New"**
2. Selecione **"Database"**
3. Escolha **"Add PostgreSQL"**

**✅ Railway conecta automaticamente via variável DATABASE_URL!**

Regras para evitar falha no Prisma:
- `.env` local é apenas para desenvolvimento.
- Em produção, `DATABASE_URL` deve vir do PostgreSQL do Railway.
- O valor precisa começar com `postgresql://` ou `postgres://`.
- Se a variável não aparecer automaticamente, use `DATABASE_URL=${{Postgres.DATABASE_URL}}`.

---

### 4️⃣ Configurar Variável de Ambiente

**IMPORTANTE:** Sem isso, a API não inicia!

1. No dashboard, clique no serviço da **API** (não no PostgreSQL)
2. Vá na aba **"Variables"**
3. Clique em **"+ New Variable"**
4. Adicione:

```
Name:  JWT_SECRET
Value: solid-service-jwt-secret-prod-2024-xyz-abc-123-mudar-isso
```

**💡 Dica:** Pode usar qualquer string longa e aleatória como valor.

**Variáveis opcionais** (já tem valores padrão no código):
```
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=production
```

---

### 5️⃣ Aguardar o Build (2-3 min)

Railway vai automaticamente:
- ✅ `npm install` (instalar dependências)
- ✅ `npx prisma generate` (gerar Prisma Client)
- ✅ `npm run build` (compilar TypeScript)
- ✅ Iniciar a aplicação

Na inicialização do serviço:
- ✅ `npx prisma migrate deploy` (rodar migrations)

**Você pode acompanhar o progresso no log de deploy.**

**Quando aparecer "Deployed", a URL estará disponível!**

Exemplo: `https://solid-services-production.up.railway.app`

---

### 6️⃣ Popular o Banco com Dados de Teste (Seed)

**Opção A: Via Railway CLI (Recomendado)**

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Conectar ao projeto
railway link

# Rodar seed
railway run npm run db:seed
```

**Opção B: Via URL do Banco (Mais Rápido)**

1. No Railway, clique no **PostgreSQL** (database)
2. Vá em **"Connect"** → Copie a **"Postgres Connection URL"**
3. No terminal local:

```bash
cd C:\Users\blima\Desktop\Documentos\solid-service
DATABASE_URL="cole-a-url-aqui" npm run db:seed
```

**Exemplo:**
```bash
DATABASE_URL="postgresql://postgres:senha123@containers-us-west-xyz.railway.app:5432/railway" npm run db:seed
```

---

## 🧪 TESTAR A API

### 1. Acessar o Swagger (Documentação Interativa)

```
https://seu-app.up.railway.app/api/docs
```

### 2. Fazer Login

No Swagger, vá em **POST /api/v1/auth/login** e teste com:

```json
{
  "email": "admin@democompany.com",
  "password": "admin123"
}
```

### 3. Copiar o Token

Na resposta, copie o valor do campo `accessToken`.

### 4. Autorizar no Swagger

1. Clique no botão **"Authorize"** 🔓 (canto superior direito)
2. Cole no campo: `Bearer SEU_TOKEN_AQUI`
3. Clique em **"Authorize"**

### 5. Testar Endpoints Protegidos

Agora você pode testar:
- `GET /api/v1/customers` - Listar clientes
- `POST /api/v1/customers` - Criar novo cliente
- `GET /api/v1/customers/{id}` - Detalhes de um cliente

---

## ✅ CHECKLIST DE DEPLOY

- [ ] Login no Railway com GitHub
- [ ] Deploy do repositório `brendondev/solid-services`
- [ ] Adicionar PostgreSQL ao projeto
- [ ] Configurar variável `JWT_SECRET`
- [ ] Aguardar build (2-3 min)
- [ ] Rodar seed no banco
- [ ] Acessar Swagger e testar login
- [ ] Testar CRUD de customers

---

## 🎯 INFORMAÇÕES IMPORTANTES

### Credenciais de Teste (Seed)

**Admin:**
- Email: `admin@democompany.com`
- Password: `admin123`
- Roles: `admin`

**Técnico:**
- Email: `tecnico@democompany.com`
- Password: `tecnico123`
- Roles: `technician`

**Tenant:** `demo-company`

---

## 📊 O QUE FOI IMPLEMENTADO

✅ **Backend completo:**
- Multi-tenancy com isolamento por tenant_id
- Autenticação JWT + Refresh Tokens
- CRUD de Customers (com contatos e endereços)
- Swagger para documentação automática
- Prisma ORM com PostgreSQL
- Middleware de isolamento de tenant
- Testes de segurança

✅ **Dados de demonstração:**
- 1 Tenant (Demo Company)
- 2 Usuários (admin e técnico)
- 2 Clientes
- 3 Serviços no catálogo
- 1 Orçamento
- 1 Ordem de Serviço
- 1 Recebível (contas a receber)

---

## ❓ PROBLEMAS COMUNS

### ❌ Erro: "Cannot read property 'id' of undefined"
**Solução:** Você esqueceu de rodar o seed. Execute o passo 6 novamente.

### ❌ Erro ao fazer login no Swagger
**Solução:** Certifique-se que rodou o seed para criar os usuários de teste.

### ❌ Build falhou no Railway
**Possíveis causas:**
1. Esqueceu de adicionar `JWT_SECRET` nas variáveis
2. PostgreSQL não foi adicionado (falta DATABASE_URL)
3. `DATABASE_URL` está com valor local/inválido em vez de `postgresql://...`

### ❌ Não consigo encontrar o repositório no Railway
**Solução:** Certifique-se que está logado com a conta GitHub correta: `brendondev`

### ❌ Deploy demora muito (>5 min)
**Normal na primeira vez.** Railway faz cache das dependências, próximos deploys serão mais rápidos.

---

## 🔐 SEGURANÇA - PRÓXIMOS PASSOS

**ANTES DE USAR EM PRODUÇÃO:**

1. **Mudar JWT_SECRET** para uma string realmente aleatória:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Configurar domínio customizado** no Railway (opcional)

3. **Adicionar rate limiting** para prevenir abuso de API

4. **Configurar CORS** para permitir apenas seu frontend

5. **Habilitar HTTPS** (Railway já faz isso automaticamente)

---

## 📖 ENDPOINTS DISPONÍVEIS

### Autenticação
- `POST /api/v1/auth/register` - Criar novo tenant + admin
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Renovar token

### Customers
- `GET /api/v1/customers` - Listar (com paginação)
- `POST /api/v1/customers` - Criar
- `GET /api/v1/customers/{id}` - Detalhes
- `PATCH /api/v1/customers/{id}` - Atualizar
- `DELETE /api/v1/customers/{id}` - Deletar (soft delete)
- `GET /api/v1/customers/active` - Listar apenas ativos

**Documentação completa:** `https://seu-app.up.railway.app/api/docs`

---

## 🎉 PRONTO!

Sua API está no ar e pronta para uso!

**Próximos módulos a implementar:**
- [ ] Services (catálogo de serviços) ✅ (schema pronto)
- [ ] Quotations (orçamentos)
- [ ] Service Orders (ordens de serviço)
- [ ] Scheduling (agenda)
- [ ] Financial (contas a receber)
- [ ] Portal do Cliente
- [ ] Dashboard operacional
- [ ] Frontend Next.js

---

**Precisa de ajuda?** Abra uma issue no GitHub!

**GitHub:** https://github.com/brendondev/solid-services
