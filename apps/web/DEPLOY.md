# Deploy do Frontend no Vercel

## Pré-requisitos
- Conta no Vercel (https://vercel.com)
- Código no GitHub

## Passo a Passo

### 1. Fazer Push para GitHub

```bash
# Se ainda não tiver repositório
git init
git add .
git commit -m "feat: frontend completo"
git remote add origin https://github.com/seu-usuario/solid-service.git
git push -u origin main
```

### 2. Importar no Vercel

1. Acesse https://vercel.com
2. Clique em "Add New Project"
3. Selecione seu repositório GitHub
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Configurar Variável de Ambiente

Na seção "Environment Variables":

```
NEXT_PUBLIC_API_URL = https://seu-backend.railway.app/api/v1
```

**IMPORTANTE**: Substitua pela URL real do seu backend no Railway!

### 4. Deploy

Clique em "Deploy" e aguarde.

O Vercel vai:
- Instalar dependências
- Rodar build
- Fazer deploy automático

## Após o Deploy

### URL do Frontend
Você receberá uma URL como:
```
https://solid-service-web.vercel.app
```

### Testar
1. Acesse a URL
2. Faça login com:
   - Email: admin@demo.com
   - Senha: Admin@123

### Configurar Domínio Customizado (Opcional)
1. No Vercel, vá em Settings > Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções

## Deploys Automáticos

Agora, a cada push para `main`, o Vercel fará deploy automático!

## Verificar Logs

Se houver erro:
1. Vercel Dashboard > Seu Projeto
2. Aba "Deployments"
3. Clique no deploy com erro
4. Veja os logs detalhados

## CORS (Se necessário)

Se o backend bloquear requisições, adicione no backend (apps/api/src/main.ts):

```typescript
app.enableCors({
  origin: ['https://solid-service-web.vercel.app', 'http://localhost:3001'],
  credentials: true,
});
```

## URLs Importantes

- **Backend Railway**: https://seu-backend.railway.app
- **API Swagger**: https://seu-backend.railway.app/api/docs
- **Frontend Vercel**: https://solid-service-web.vercel.app

---

**Pronto! Seu frontend está no ar! 🚀**
