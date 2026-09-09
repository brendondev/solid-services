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

---

## Opção A — Docker (recomendada)

Requer Docker Desktop. Sobe Postgres, Redis, API e Web; a API aplica as
migrations e roda o seed sozinha no primeiro boot.

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

## Opção B — sem Docker (Postgres portátil)

Esta máquina de desenvolvimento não tem Docker instalado e a distro do WSL
está com o disco (`ext4.vhdx`) ausente, então o WSL também não sobe. Para
destravar os testes sem depender de instalação, `scripts/local-postgres.js`
baixa os binários portáteis do PostgreSQL 15 da EnterpriseDB, cria um cluster
dentro de `.local/` e sobe o servidor. Não instala nada no sistema, não pede
administrador, e apagar `.local/` desfaz tudo.

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
