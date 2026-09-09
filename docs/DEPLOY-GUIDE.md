# Guia de Deploy — Solid Service

> **Status em 09/09/2026:** o projeto **não está publicado**. Saiu do Vercel
> (web) + Railway (API) e hoje roda apenas local. O destino é **VPS Contabo +
> Coolify**, ainda não iniciado.
>
> Para rodar o projeto agora, veja **[../LOCAL.md](../LOCAL.md)**.
> Para entender o que mudou e por quê, veja
> **[MIGRACAO-LOCAL-2026-09-09.md](MIGRACAO-LOCAL-2026-09-09.md)**.

O guia antigo de Vercel + Railway está em
[`archive/DEPLOY-VERCEL-RAILWAY.md`](archive/DEPLOY-VERCEL-RAILWAY.md), como
referência histórica. Não siga aquele documento: os arquivos de configuração
que ele pressupõe (`vercel.json`, `railway.json`, `Procfile`) foram removidos.

---

## O modelo de deploy atual

Duas imagens Docker, construídas a partir da **raiz do monorepo**:

| Serviço | Dockerfile | Porta |
| --- | --- | --- |
| API (NestJS) | `apps/api/Dockerfile` | 3000 |
| Web (Next.js) | `apps/web/Dockerfile` | 3001 |

Mais Postgres e Redis, que no Coolify vêm de serviços gerenciados em vez do
`docker-compose.yml` local.

As migrations **não** rodam via `package.json`: quem aplica é o
`docker/api-entrypoint.sh`, no boot do container, antes de subir a API.

---

## Checklist para o Coolify

### 1. Banco

Provisione um Postgres e anote a connection string. O entrypoint da API roda
`prisma migrate deploy` sozinho no primeiro boot — não precisa migrar à mão.

### 2. Serviço da API

Build a partir do `apps/api/Dockerfile`, **contexto = raiz do repositório**.

Variáveis:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<postgres do VPS>

# Gere um de verdade:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=<segredo longo e aleatório>
JWT_EXPIRES_IN=8h
REFRESH_TOKEN_EXPIRES_IN=7d

WEB_URL=https://<dominio>
FRONTEND_URL=https://<dominio>
PORTAL_URL=https://<dominio>
API_BASE_URL=https://api.<dominio>
CORS_ALLOWED_ORIGINS=https://<dominio>

RUN_MIGRATIONS=true
RUN_SEED=false          # o seed é só demonstração — nunca em produção
SKIP_DOCUMENT_VALIDATION=false

# Storage: sem estas chaves, grava no filesystem do container (efêmero).
# Para produção, configure S3 ou monte um volume persistente.
S3_ENDPOINT=
S3_REGION=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
```

> Com várias réplicas, deixe `RUN_MIGRATIONS=true` em apenas uma para evitar
> migrations concorrentes.

### 3. Serviço Web

Build a partir do `apps/web/Dockerfile`, **contexto = raiz do repositório**.

⚠️ **`NEXT_PUBLIC_API_URL` é um build arg, não uma env de runtime.** O Next
embute variáveis `NEXT_PUBLIC_*` no bundle durante o build. Configure no
Coolify como *build argument*:

```
NEXT_PUBLIC_API_URL=https://api.<dominio>/api/v1
```

Mudar essa URL depois **exige rebuild da imagem**. Alterar a env do container
não surte efeito nenhum — é a pegadinha mais provável nesse deploy.

### 4. Primeiro acesso

Com `RUN_SEED=false` não existe usuário nenhum no banco. Crie o primeiro
tenant e admin pelo endpoint de registro (`POST /api/v1/auth/register`) ou
rode um seed próprio de produção.

---

## Pendência de segurança

🔴 **Rotacionar as credenciais de S3.** O `.env.example` versionado continha
`S3_ACCESS_KEY_ID` e `S3_SECRET_ACCESS_KEY` reais em repositório **público**.
Foram trocados por placeholders, mas seguem no histórico do git e devem ser
tratados como comprometidos.

Antes de publicar, confira também:

- `JWT_SECRET` diferente do valor de desenvolvimento
- `NODE_ENV=production` (desliga os controllers de debug — veja
  `apps/api/src/app.module.ts`)
- `CORS_ALLOWED_ORIGINS` sem `localhost`
