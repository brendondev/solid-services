# Migração para ambiente local — 09/09/2026

Registro do que mudou quando o projeto saiu de **Vercel (web) + Railway (API)**
e voltou a rodar na máquina de desenvolvimento. Destino futuro: **VPS Contabo +
Coolify**, consumindo os mesmos Dockerfiles criados aqui.

Leia junto com **[../LOCAL.md](../LOCAL.md)**, que é o passo a passo de setup.
Este documento explica *por quê* cada coisa está como está — é o que evita
desfazer uma decisão sem saber o motivo.

---

## Estado no fim da migração

| Item | Situação |
| --- | --- |
| Postgres local | ✅ rodando (`.local/`, sem Docker) — migrado e populado |
| API NestJS | ✅ rodando em `localhost:3000` |
| Web Next.js | ✅ rodando em `localhost:3001` |
| Login demo | ✅ verificado ponta a ponta (token + dados do tenant) |
| Docker Desktop | ✅ instalado (4.90, engine 29.7.2, Compose v5.5.1, backend WSL2) |
| Imagens Docker | ⏳ build executado, ainda não concluído até o fechamento deste doc |
| Deploy Coolify | ⬜ não iniciado |

### Credenciais de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Admin | `admin@demo.com` | `123456` |
| Técnico | `tecnico@demo.com` | `123456` |

Tenant `demo` (“Empresa Demo”). Criados pelo seed — **só para ambiente local**.

---

## Ponto de partida: o repositório não estava no disco

A pasta `micro-saas/solid-services` estava **vazia**. O código foi clonado de
`github.com/brendondev/solid-services`. Se a pasta aparecer vazia de novo, é
isso: clonar de novo, não recriar o projeto.

---

## Bugs pré-existentes que impediam rodar local

Nenhum destes foi introduzido pela migração — todos já estavam no repositório
e só apareceram porque ninguém subia o projeto do zero havia tempo.

### 1. O seed dependia de um tenant do banco da Railway

`packages/database/prisma/seed/index.ts` tinha o ID fixo
`1875be3a-c4c5-49fa-aba2-9df95fb152c5` e dava `process.exit(1)` se não achasse.
Em banco novo, isso significava que **o seed nunca rodava**.

Agora faz `upsert` do tenant pelo slug (`demo`, configurável via
`SEED_TENANT_SLUG`).

### 2. O seed gravava campos que não existem

Escrevia `category` e `unit` em `Service` — o model não tem nenhum dos dois.
Não era pego pelo TypeScript porque os dados iam via spread (`...svc`), que
não dispara checagem de excesso de propriedades. Campos removidos.

### 3. O seed não era idempotente

Clientes, orçamento, OS e recebível eram criados sem verificação: a segunda
execução estourava em constraint única. Agora tudo é `upsert`/`findFirst`.
Verificado rodando duas vezes seguidas — as contagens não mudam
(`users=2 customers=2 services=4 quotations=1 orders=1 receivables=1`).

### 4. `package-lock.json` dessincronizado

O merge do dependabot subiu `@hookform/resolvers` para `^5.2.2` no
`package.json` mas o lock continuou em `^3.3.4`. `npm ci` falha nessa
situação — ou seja, **todo build Docker falharia** antes mesmo de começar.
Reconciliado com `npm install`.

### 5. Fallback de URL da API apontando para o próprio front

`apps/web/src/services/chat.ts` caía em `http://localhost:3001/api/v1` (a
porta do Next) em vez de `3000` (a API). Todos os outros arquivos já usavam
3000; era o único fora do padrão.

---

## Decisões de infraestrutura

### Um único `.env` na raiz

A API roda com `cwd = apps/api`, mas o Prisma CLI roda a partir da raiz. Em
vez de manter dois arquivos em sincronia, `apps/api/src/app.module.ts` procura
em `['.env', '../../.env']` e os scripts `db:*` chamam o Prisma da raiz com
`--schema`. O primeiro arquivo encontrado vence, então um `apps/api/.env`
ainda sobrescreve, se um dia for preciso.

O **front não precisa de `.env`**: o código já cai em
`http://localhost:3000/api/v1`.

### `NEXT_PUBLIC_API_URL` é build-time, não runtime

O Next embute variáveis `NEXT_PUBLIC_*` no bundle durante o build. Na imagem
Docker ela entra como `ARG`. **Trocar a URL da API exige rebuild da imagem** —
mudar a env do container não tem efeito nenhum. Vale lembrar disso ao subir
no Coolify.

### Storage cai no filesystem sem S3

`StorageService` decide por `useS3 = !!(accessKeyId && secretAccessKey)`. Sem
as chaves, grava em `LOCAL_STORAGE_PATH` (padrão `./uploads`). É o
comportamento desejado em local — **não configure S3 para testar**.

### `output: 'standalone'` no Next

Necessário para a imagem web ficar enxuta. Junto vai
`outputFileTracingRoot` apontando para a raiz do monorepo, senão o tracing não
acha o `node_modules` hoisted do workspace.

### `node_modules` da imagem da API vem do stage de build

De propósito, e não de um `npm ci --omit=dev`: o runtime precisa do Prisma
Client já gerado (`node_modules/.prisma`) **e** do CLI do Prisma, que o
entrypoint usa para aplicar as migrations. O CLI é `devDependency` de
`packages/database`, então um prune quebraria as migrations no boot.

### `.gitattributes` forçando LF

Esta máquina tem `core.autocrlf=true`. Sem o `.gitattributes`,
`docker/api-entrypoint.sh` seria copiado para a imagem com CRLF, o shebang
viraria `#!/bin/sh\r` e o container morreria com “no such file or directory” —
um erro que não deixa nenhuma pista útil no log.

---

## Postgres portátil (alternativa sem Docker)

`scripts/local-postgres.js` existe porque a máquina não tinha Docker e o WSL
está com a distro Ubuntu registrada mas **sem o disco** (`ext4.vhdx` ausente,
`wsl -d Ubuntu` falha com `ERROR_FILE_NOT_FOUND`). O script baixa os binários
portáteis do PostgreSQL 15 da EnterpriseDB, cria um cluster em `.local/` e
sobe via `pg_ctl` — sem instalar nada, sem privilégio de administrador.

Continua útil mesmo com o Docker instalado: sobe em segundos e não depende do
engine estar rodando.

Duas armadilhas que custaram tempo e estão resolvidas no script:

- **`Expand-Archive` é inviável** para um zip de 320 MB (levou minutos sem
  terminar). O script usa `System.IO.Compression` e filtra as entradas.
- **Extrai só `pgsql/bin`, `pgsql/lib` e `pgsql/share`** — 118 MB em vez de
  mais de 1 GB, porque o zip da EDB traz pgAdmin 4 e StackBuilder junto.
  `share/` **não** é opcional: o `initdb` lê dali os arquivos de timezone e os
  scripts SQL de bootstrap.

SQLite não é alternativa: o schema usa `String[]` e colunas `Json`,
específicos do PostgreSQL.

---

## Arquivos removidos

Removidos por serem específicos das plataformas que o projeto deixou. Todos
continuam recuperáveis no histórico do git.

| Arquivo | Motivo |
| --- | --- |
| `vercel.json`, `apps/web/vercel.json` | configuração de build do Vercel |
| `railway.json`, `Procfile` | build e start da Railway |
| `apps/web/DEPLOY.md` | guia de deploy no Vercel |
| `.github/workflows/deploy-preview.yml` | preview Vercel/Railway; além disso chamava `npm run build` na raiz, script que não existe |
| `api.pid`, `apps/api/api.log` | artefatos de runtime versionados por engano |

`.github/workflows/ci.yml` foi **mantido** — é neutro de plataforma.

---

## Pendências

### 🔴 Rotacionar as credenciais de S3

O `.env.example` versionado continha `S3_ACCESS_KEY_ID` e
`S3_SECRET_ACCESS_KEY` **reais** (bucket Turso/T3) em repositório **público**.
Foram substituídos por placeholders, mas **as chaves seguem no histórico do
git** e devem ser tratadas como comprometidas. Rotacionar no provedor.

### 🟡 Concluir o build das imagens Docker

O build foi disparado e estava progredindo, mas não terminou dentro da sessão.
`npm ci` de ~1200 pacotes mais o build do Next dentro do container é lento na
primeira vez; as camadas ficam em cache para as próximas.

Quando concluir: `docker compose up -d`.

### 🟡 Conflito de porta 5432

O Postgres portátil e o container `postgres` disputam a 5432. Antes de subir
via Docker: `npm run pg:stop`. Alternativa, se quiser os dois ao mesmo tempo:
mudar o mapeamento do compose para `'5433:5432'` e ajustar a `DATABASE_URL`.

### ⬜ Deploy no Coolify

Não iniciado. O que muda em relação ao local está listado no fim do
`LOCAL.md`.

---

## Detalhe do app que confunde

**Não existe rota `/dashboard`.** O login redireciona para
`/dashboard/main` (`apps/web/src/app/auth/login/page.tsx:48`). Um 404 em
`/dashboard` é o comportamento esperado, não regressão.

A tela de login fica em **`/auth/login`**, não `/login`.
