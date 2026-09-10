# Rodando o Solid Service localmente

O projeto saiu do Vercel (web) + Railway (API). Agora tudo roda na máquina.
O destino futuro é VPS Contabo + Coolify, que consome os mesmos `Dockerfile`s
descritos aqui — então o caminho Docker é o que vale a pena manter azeitado.

**Credenciais de demonstração** (criadas pelo seed):

| Perfil  | E-mail             | Senha    |
| ------- | ------------------ | -------- |
| Admin   | `admin@demo.com`   | `123456` |
| Técnico | `tecnico@demo.com` | `123456` |

Tenant: `demo` · Login: http://localhost:3001/auth/login ·
API: http://localhost:3000 · Swagger: http://localhost:3000/api/docs

> **A tela de login é `/auth/login`, não `/login`.** E **não existe rota
> `/dashboard`** — o login redireciona para `/dashboard/main`. Um 404 em
> `/dashboard` é esperado.

Por que o projeto está assim e o que já foi resolvido:
**[docs/MIGRACAO-LOCAL-2026-09-09.md](docs/MIGRACAO-LOCAL-2026-09-09.md)**.

---

## Opção A — Docker

O Docker Desktop **já está instalado** (4.90, engine 29.7.2, Compose v5.5.1,
backend WSL2). Se o `docker` não responder, abra o Docker Desktop e espere o
engine subir.

> **Status:** as duas imagens **buildam** (`docker compose build` = `EXIT=0`),
> mas a stack rodando **ainda não foi validada** — o `docker compose up -d`
> não chegou a criar os containers na primeira tentativa. Se você precisa de
> ambiente funcionando agora, use a **Opção B**, que está verificada ponta a
> ponta. Detalhes e o roteiro de investigação em
> [docs/MIGRACAO-LOCAL-2026-09-09.md](docs/MIGRACAO-LOCAL-2026-09-09.md).

Sobe Postgres, Redis, API e Web; a API aplica as migrations e roda o seed
sozinha no primeiro boot.

> O primeiro build é lento (~20 min): dois `apt-get install` de ~5 min cada
> para compilar o `bcrypt`, mais `npm ci` e o build do Next. Cache parado não
> quer dizer build travado. Para acompanhar de verdade:
> `docker compose build --progress=plain > build.log 2>&1`

> **Antes de subir, pare o Postgres portátil** (`npm run pg:stop`) — os dois
> disputam a porta 5432. Para rodar os dois juntos, mude o mapeamento do
> compose para `'5433:5432'` e ajuste a `DATABASE_URL`.

```bash
docker compose up -d --build      # ou: npm run docker:up
docker compose logs -f api        # acompanha migrations + seed
```

Abra http://localhost:3001/auth/login e entre com `admin@demo.com` / `123456`.

Para derrubar tudo (mantendo os dados): `docker compose down`
Para apagar os dados também: `docker compose down -v`

### Só a infraestrutura, app em modo dev

Melhor combinação para desenvolver, porque mantém o hot reload:

```bash
npm run docker:infra              # sobe apenas postgres + redis
cp .env.example .env
npm run db:setup                  # generate + migrate + seed
npm run dev:api                   # terminal 1
npm run dev:web                   # terminal 2
```

---

## Opção B — sem Docker (Postgres portátil) ⭐ é o que está em uso

`scripts/local-postgres.js` baixa os binários portáteis do PostgreSQL 15 da
EnterpriseDB, cria um cluster dentro de `.local/` e sobe o servidor. Não
instala nada no sistema, não pede administrador, e apagar `.local/` desfaz
tudo.

Nasceu porque a máquina não tinha Docker (e o WSL está com a distro Ubuntu
registrada mas sem o disco `ext4.vhdx`, então também não era saída). Continua
útil mesmo com o Docker instalado: sobe em segundos e não depende do engine
estar rodando.

> SQLite não é alternativa aqui: o schema usa `String[]` e colunas `Json`,
> que são específicos do PostgreSQL.

```bash
npm run pg:setup                  # baixa (~320 MB, uma vez), inicializa e sobe
cp .env.example .env
npm run db:setup                  # generate + migrate + seed
npm run dev:api                   # terminal 1
npm run dev:web                   # terminal 2
```

Controle do servidor:

```bash
npm run pg:start
npm run pg:stop
npm run pg:status
node scripts/local-postgres.js reset   # apaga o cluster e recomeça
```

---

## Variáveis de ambiente

Um único `.env` na raiz atende a API e o Prisma CLI — `apps/api/src/app.module.ts`
procura em `.env` e depois em `../../.env`, e os scripts `db:*` chamam o Prisma
a partir da raiz com `--schema`.

O front não precisa de `.env`: o código já cai em `http://localhost:3000/api/v1`.
Só crie `apps/web/.env.local` com `NEXT_PUBLIC_API_URL` se for apontar para
outra API.

> `NEXT_PUBLIC_API_URL` é embutida no bundle em **tempo de build**. Na imagem
> Docker ela é um `ARG`; trocar a URL exige rebuild, não basta mudar a env.

### Storage

Sem `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY`, o `StorageService` grava no
filesystem (`LOCAL_STORAGE_PATH`, padrão `./uploads`). É o comportamento
esperado em local — não configure S3 para testar.

---

## Comandos de banco

| Script                 | O que faz                                  |
| ---------------------- | ------------------------------------------ |
| `npm run db:generate`  | Gera o Prisma Client                       |
| `npm run db:migrate`   | Aplica migrations (`migrate deploy`)       |
| `npm run db:seed`      | Popula tenant demo, usuários e dados       |
| `npm run db:setup`     | Os três acima em sequência                 |
| `npm run db:studio`    | Prisma Studio                              |
| `npm run db:reset`     | Dropa, remigra e roda o seed               |

O seed é idempotente: pode rodar quantas vezes quiser sem duplicar dados.

---

## Deploy futuro (Coolify)

`apps/api/Dockerfile` e `apps/web/Dockerfile` já são multi-stage e
independentes de plataforma — é o que o Coolify vai consumir. O que muda
em relação ao local:

- `JWT_SECRET` real (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
- `DATABASE_URL` apontando para o Postgres do VPS
- `WEB_URL` / `FRONTEND_URL` / `PORTAL_URL` / `CORS_ALLOWED_ORIGINS` com o domínio
- `NEXT_PUBLIC_API_URL` como build arg da imagem web
- `RUN_SEED=false` (o seed é só para demonstração)
- Credenciais de S3, se for usar storage remoto
