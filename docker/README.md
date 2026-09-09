# Docker

Stack local completa definida em `docker-compose.yml` na raiz. As mesmas
imagens são o que o Coolify vai consumir no VPS mais adiante.

| Serviço    | Imagem / origem            | Porta | Observação                              |
| ---------- | -------------------------- | ----- | --------------------------------------- |
| `postgres` | `postgres:15-alpine`       | 5432  | user `solid` / senha `solid123` / db `solid_service_dev` |
| `redis`    | `redis:7-alpine`           | 6379  | cache e filas                            |
| `api`      | `apps/api/Dockerfile`      | 3000  | NestJS; migra e roda o seed no boot      |
| `web`      | `apps/web/Dockerfile`      | 3001  | Next.js em modo `standalone`             |

Não há MinIO: sem chaves de S3 configuradas, o `StorageService` grava no
filesystem (volume `api_uploads` montado em `/app/uploads`).

## Comandos

```bash
docker compose up -d --build      # sobe tudo
docker compose up -d postgres redis   # só a infra (app roda no host, com hot reload)
docker compose logs -f api web
docker compose ps
docker compose down               # para tudo, preserva os dados
docker compose down -v            # CUIDADO: apaga os volumes
```

## Consoles

```bash
docker exec -it solid-service-postgres psql -U solid -d solid_service_dev
docker exec -it solid-service-redis redis-cli
```

## Como as imagens são construídas

Ambos os Dockerfiles esperam **a raiz do monorepo como contexto de build**,
porque precisam do `package-lock.json` e dos workspaces:

```bash
docker build -f apps/api/Dockerfile .
docker build -f apps/web/Dockerfile .
```

### API (`apps/api/Dockerfile`)

Multi-stage: `deps` (com toolchain para compilar o `bcrypt`) → `build`
(`prisma generate` + `nest build`) → `runtime`.

O `node_modules` do runtime vem do stage de build de propósito: ele carrega o
Prisma Client já gerado (`node_modules/.prisma`) e o CLI do Prisma, usado pelo
`docker/api-entrypoint.sh` para aplicar as migrations antes de subir a API.

Variáveis que o entrypoint respeita:

- `RUN_MIGRATIONS` (padrão `true`) — aplica `prisma migrate deploy`
- `RUN_SEED` (padrão `false`) — roda o seed de demonstração

### Web (`apps/web/Dockerfile`)

Usa `output: 'standalone'` do Next para a imagem final ficar enxuta.

> `NEXT_PUBLIC_API_URL` entra como **build arg** — o Next embute variáveis
> `NEXT_PUBLIC_*` no bundle em tempo de build. Mudar a URL da API exige
> rebuild da imagem; alterar a env em runtime não tem efeito.

## Troubleshooting

**API sobe e morre em seguida** — quase sempre é migration falhando. Veja
`docker compose logs api`; o entrypoint loga cada etapa.

**Postgres não fica saudável** — `docker compose logs postgres`. Se a porta
5432 já estiver ocupada no host (por um Postgres local), mude o mapeamento
para `'5433:5432'` e ajuste a `DATABASE_URL`.

**Recomeçar do zero**

```bash
docker compose down -v
docker compose up -d --build
```
