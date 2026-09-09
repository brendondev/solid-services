# 🚀 Guia de Início Rápido — Solid Service

> **O passo a passo de setup mora em [`../LOCAL.md`](../LOCAL.md).** Ele é a
> fonte de verdade e cobre os dois caminhos (Docker e Postgres portátil).
> Este documento cobre o entorno: comandos do dia a dia, problemas comuns e
> estrutura do projeto.
>
> Contexto de como o projeto chegou ao estado atual:
> [`MIGRACAO-LOCAL-2026-09-09.md`](MIGRACAO-LOCAL-2026-09-09.md).

## Resumo do setup

```bash
git clone https://github.com/brendondev/solid-services.git
cd solid-services
npm install
cp .env.example .env
```

Depois escolha **um** caminho para o banco:

```bash
# A) Docker (já instalado nesta máquina)
docker compose up -d --build          # sobe tudo, migra e seeda sozinho

# B) Sem Docker — Postgres portátil em .local/
npm run pg:setup
npm run db:setup                      # generate + migrate + seed
npm run dev:api                       # terminal 1
npm run dev:web                       # terminal 2
```

> Os dois caminhos disputam a porta 5432. Antes de subir via Docker:
> `npm run pg:stop`.

## Primeiro acesso

**http://localhost:3001/auth/login**

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Admin | `admin@demo.com` | `123456` |
| Técnico | `tecnico@demo.com` | `123456` |

⚠️ **A rota é `/auth/login`, não `/login`.** E **não existe `/dashboard`** — o
login redireciona para `/dashboard/main`. Um 404 em `/dashboard` é esperado.

### Dados criados pelo seed

Tenant `demo` (“Empresa Demo”), 2 usuários, 2 clientes, 4 serviços,
1 orçamento, 1 ordem de serviço e 1 recebível. O seed é **idempotente** —
rodar de novo não duplica nada.

## Variáveis de ambiente

Um **único `.env` na raiz** atende a API e o Prisma CLI. Comece por
`cp .env.example .env`; para desenvolvimento local os valores padrão já
servem.

O front **não precisa de `.env`** — o código já cai em
`http://localhost:3000/api/v1`.

Sem `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY`, os uploads vão para o
filesystem (`LOCAL_STORAGE_PATH`, padrão `./uploads`). É o comportamento
desejado em local: **não configure S3 para testar**.

## Comandos úteis

```bash
# Banco
npm run db:generate      # gera o Prisma Client
npm run db:migrate       # aplica migrations (migrate deploy)
npm run db:seed          # popula dados de demonstração
npm run db:setup         # os três acima
npm run db:studio        # Prisma Studio
npm run db:reset         # dropa, remigra e roda o seed

# Postgres portátil
npm run pg:start / pg:stop / pg:status

# Docker
npm run docker:up        # build + sobe a stack toda
npm run docker:infra     # só postgres + redis
npm run docker:logs
npm run docker:down

# Build
npm run build:api
npm run build:web
```

## Problemas comuns

### Porta 5432 ocupada

O Postgres portátil e o container `postgres` competem pela porta. Rode
`npm run pg:stop` antes do `docker compose up`, ou mude o compose para
`'5433:5432'` e ajuste a `DATABASE_URL`.

### Erro de conexão com o banco

```bash
npm run pg:status        # Postgres portátil está de pé?
docker compose ps        # ou o container está saudável?
```

Confira a `DATABASE_URL` no `.env` da **raiz** (não em `apps/api`).

### Porta 3000 ou 3001 em uso

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object OwningProcess
Stop-Process -Id <pid>
```

### Prisma Client desatualizado

```bash
npm run db:generate
```

### `npm ci` falha no build do Docker

Sinal de `package.json` e `package-lock.json` dessincronizados — normalmente
depois de um merge do dependabot. Rode `npm install` na raiz e commite o lock.

### Container da API sobe e morre

Quase sempre é migration falhando. `docker compose logs api` — o
`docker/api-entrypoint.sh` loga cada etapa antes de subir o servidor.

## Estrutura do projeto

```
solid-services/
├── apps/
│   ├── api/            # Backend NestJS  (Dockerfile aqui)
│   └── web/            # Frontend Next.js (Dockerfile aqui)
├── packages/
│   └── database/       # Prisma: schema, migrations e seed
├── docker/             # entrypoint da API + notas do compose
├── scripts/            # local-postgres.js e setup
├── docs/               # documentação
├── LOCAL.md            # ⭐ setup local (fonte de verdade)
└── docker-compose.yml  # stack local completa
```

## Próximos passos

- 🐳 [Docker e imagens](../docker/README.md)
- 🚀 [Deploy (Coolify)](DEPLOY-GUIDE.md)
- 📊 [Status do projeto](PROJECT-STATUS.md)
- ⌨️ [Atalhos de teclado](KEYBOARD_SHORTCUTS.md)
- 🔐 [Testes de segurança](SECURITY-TESTS.md)

## Suporte

- 📖 [Documentação completa](README.md)
- 🐛 [Reportar bug](https://github.com/brendondev/solid-services/issues)
