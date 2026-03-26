# 🚀 Guia de Deploy - Solid Service

**Status**: ✅ Código no GitHub, pronto para deploy!

## 📋 Pré-requisitos

- [x] Código no GitHub: `https://github.com/brendondev/solid-services`
- [x] Build passing ✅
- [ ] Conta Vercel (frontend)
- [ ] Conta Railway (backend)

---

## 🎯 Deploy Frontend (Vercel)

### 1. Acessar Vercel

1. Ir para [vercel.com](https://vercel.com)
2. Fazer login com GitHub
3. Clicar em **"Add New Project"**

### 2. Importar Repositório

1. Selecionar: `brendondev/solid-services`
2. Clicar em **"Import"**

### 3. Configurar Projeto

```
Framework Preset:     Next.js
Root Directory:       apps/web
Build Command:        npm run build
Output Directory:     .next
Install Command:      npm install
```

### 4. Variáveis de Ambiente

Adicionar em **Environment Variables**:

```bash
# API Backend (Railway URL - adicionar depois que backend estiver no ar)
NEXT_PUBLIC_API_URL=https://seu-backend.railway.app/api/v1

# Google Analytics (opcional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry (opcional)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

**IMPORTANTE**: Deixe `NEXT_PUBLIC_API_URL` em branco por enquanto. Você vai preencher depois que fizer deploy do backend.

### 5. Deploy

1. Clicar em **"Deploy"**
2. Aguardar ~2 minutos
3. Anotar a URL: `https://solid-service.vercel.app` (exemplo)

### 6. PWA - Adicionar Ícones (Importante!)

Depois do primeiro deploy:

1. Gerar ícones PWA (8 tamanhos):
   - Usar: https://www.pwabuilder.com/imageGenerator
   - Upload de logo 512x512
   - Baixar pacote de ícones

2. Adicionar ícones em `apps/web/public/icons/`:
   ```
   icon-72x72.png
   icon-96x96.png
   icon-128x128.png
   icon-144x144.png
   icon-152x152.png
   icon-192x192.png
   icon-384x384.png
   icon-512x512.png
   ```

3. Commit e push:
   ```bash
   git add apps/web/public/icons/
   git commit -m "feat: adiciona ícones PWA"
   git push
   ```

4. Vercel vai fazer re-deploy automático

---

## 🎯 Deploy Backend (Railway)

### 1. Acessar Railway

1. Ir para [railway.app](https://railway.app)
2. Fazer login com GitHub
3. Clicar em **"New Project"**

### 2. Criar Banco de Dados

1. Clicar em **"Provision PostgreSQL"**
2. Aguardar criação
3. Railway vai gerar `DATABASE_URL` automaticamente

### 3. Adicionar Repositório

1. Clicar em **"+ New"** > **"GitHub Repo"**
2. Selecionar: `brendondev/solid-services`
3. Railway detecta automaticamente

### 4. Configurar Serviço

```
Root Directory:       apps/api
Build Command:        npm run build
Start Command:        (vazio - usa Procfile)
```

### 5. Variáveis de Ambiente

Adicionar em **Variables**:

```bash
# JWT (GERAR UM SEGREDO FORTE!)
JWT_SECRET=sua_chave_secreta_super_forte_aqui_com_64_caracteres

# Database (automático pelo Railway)
DATABASE_URL=postgresql://... (já preenchido)

# Node
NODE_ENV=production

# Port (automático)
PORT=${{PORT}}
```

**Para gerar JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 6. Deploy

1. Clicar em **"Deploy"**
2. Railway vai:
   - Instalar dependências
   - Rodar migrations (via Procfile)
   - Iniciar servidor
3. Aguardar ~3 minutos
4. Anotar a URL: `https://seu-backend.railway.app`

### 7. Testar Backend

Acessar: `https://seu-backend.railway.app/health`

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2026-03-26T..."
}
```

---

## 🔗 Conectar Frontend e Backend

### 1. Atualizar Frontend

1. Voltar para Vercel
2. Ir em **Settings** > **Environment Variables**
3. Editar `NEXT_PUBLIC_API_URL`:
   ```
   https://seu-backend.railway.app/api/v1
   ```
4. Clicar em **"Save"**

### 2. Re-deploy Frontend

1. Ir em **Deployments**
2. Clicar nos "..." do último deploy
3. Clicar em **"Redeploy"**
4. Aguardar ~1 minuto

### 3. Atualizar CORS no Backend

Se necessário, adicionar domínio Vercel nas variáveis do Railway:

```bash
CORS_ALLOWED_ORIGINS=https://solid-service.vercel.app,https://solid-service-admin.vercel.app
```

---

## ✅ Verificar Deploy

### Frontend

1. Acessar: `https://solid-service.vercel.app`
2. Deve aparecer a página de login
3. Verificar console do browser (F12) - sem erros
4. Lighthouse > PWA > Score > 90

### Backend

1. Acessar: `https://seu-backend.railway.app/api-docs`
2. Deve abrir Swagger UI
3. Testar endpoint `/health`
4. Verificar logs no Railway

### Integração

1. Tentar registrar novo tenant
2. Fazer login
3. Criar cliente, ordem, etc
4. Verificar dados salvando

---

## 📊 Pós-Deploy

### Google Analytics

1. Criar conta: [analytics.google.com](https://analytics.google.com)
2. Criar propriedade GA4
3. Copiar ID: `G-XXXXXXXXXX`
4. Adicionar no Vercel: `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`
5. Re-deploy

### Sentry (Opcional)

1. Criar conta: [sentry.io](https://sentry.io)
2. Criar projeto Next.js
3. Instalar no frontend:
   ```bash
   cd apps/web
   npm install @sentry/nextjs
   npx @sentry/wizard -i nextjs
   ```
4. Adicionar DSN no Vercel
5. Commit e push

### Custom Domain (Opcional)

**Vercel**:
1. Settings > Domains
2. Adicionar domínio (ex: `app.seusite.com`)
3. Configurar DNS:
   ```
   CNAME app.seusite.com -> cname.vercel-dns.com
   ```

**Railway**:
1. Settings > Domains
2. Adicionar domínio (ex: `api.seusite.com`)
3. Configurar DNS:
   ```
   CNAME api.seusite.com -> xxxxx.railway.app
   ```

---

## 🐛 Troubleshooting

### Frontend não conecta no Backend

**Erro**: `Network Error` ou `CORS`

**Solução**:
1. Verificar `NEXT_PUBLIC_API_URL` no Vercel
2. Deve terminar com `/api/v1` (sem barra no final)
3. Verificar `CORS_ALLOWED_ORIGINS` no Railway
4. Incluir domínio Vercel completo

### Backend não inicia

**Erro**: `Application failed to respond`

**Solução**:
1. Verificar logs no Railway
2. Conferir `DATABASE_URL` está preenchido
3. Verificar migrations rodaram (Procfile)
4. Conferir `JWT_SECRET` está definido

### PWA não instala

**Erro**: Não aparece botão "Instalar"

**Solução**:
1. Verificar HTTPS (Vercel já usa)
2. Verificar ícones em `public/icons/`
3. Verificar `manifest.json` acessível
4. Verificar service worker registrado (DevTools > Application)

### Migrations falham

**Erro**: `Migration failed`

**Solução**:
1. Verificar `DATABASE_URL` correto
2. Rodar manual:
   ```bash
   railway run npx prisma migrate deploy
   ```
3. Verificar schema.prisma correto

---

## 📝 Checklist Final

Antes de considerar deploy completo:

### Obrigatório
- [ ] Frontend no ar (Vercel)
- [ ] Backend no ar (Railway)
- [ ] Conexão funcionando
- [ ] Consegue registrar tenant
- [ ] Consegue fazer login
- [ ] Consegue criar cliente/ordem

### Recomendado
- [ ] Ícones PWA adicionados
- [ ] Custom domain configurado
- [ ] Google Analytics configurado
- [ ] SSL/HTTPS funcionando (automático)
- [ ] CORS configurado

### Opcional
- [ ] Sentry configurado
- [ ] Feedback button ativo
- [ ] Lighthouse PWA > 90
- [ ] Performance > 80

---

## 🎉 Deploy Completo!

Seu app está no ar! 🚀

**URLs**:
- **Frontend**: https://solid-service.vercel.app
- **Backend**: https://seu-backend.railway.app
- **Swagger**: https://seu-backend.railway.app/api-docs

**Credenciais**:
- Registrar primeiro tenant em `/auth/register`
- Fazer login em `/auth/login`

**Próximos passos**:
1. Adicionar ícones PWA
2. Configurar Google Analytics
3. Testar em dispositivos reais (mobile)
4. Compartilhar com usuários beta

---

**Custos Mensais Estimados**:
- Vercel: **Grátis** (Hobby plan)
- Railway: **~$5-10** (Starter, $5 créditos grátis/mês)
- Google Analytics: **Grátis**
- Sentry: **Grátis** (até 5k eventos/mês)

**Total**: ~$0-10/mês para começar 💰
