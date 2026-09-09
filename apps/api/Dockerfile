# syntax=docker/dockerfile:1

# ============================================================================
# Solid Service - API (NestJS)
# Build context = raiz do monorepo:  docker build -f apps/api/Dockerfile .
# ============================================================================

FROM node:22-bookworm-slim AS base
ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false
# openssl é exigido pelo engine do Prisma
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ----------------------------------------------------------------------------
# deps: instala o workspace inteiro (bcrypt precisa de toolchain para compilar
# caso não exista prebuild para a versão do Node)
# ----------------------------------------------------------------------------
FROM base AS deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/database/package.json packages/database/package.json
RUN npm ci

# ----------------------------------------------------------------------------
# build: gera o Prisma Client e compila a API
# ----------------------------------------------------------------------------
FROM deps AS build
COPY tsconfig.json ./
COPY packages/database packages/database
COPY apps/api apps/api
RUN npx prisma generate --schema packages/database/prisma/schema.prisma
RUN npm run build --workspace @solid-service/api

# ----------------------------------------------------------------------------
# runtime
# ----------------------------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3000

# node_modules vem do stage de build porque carrega o Prisma Client já gerado
# (node_modules/.prisma) e o CLI do Prisma usado pelo entrypoint nas migrations.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/packages/database ./packages/database
COPY package.json ./
COPY docker/api-entrypoint.sh /usr/local/bin/api-entrypoint.sh
RUN chmod +x /usr/local/bin/api-entrypoint.sh

# Diretório de uploads usado quando não há S3 configurado (LOCAL_STORAGE_PATH)
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
USER node

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/api-entrypoint.sh"]
CMD ["node", "apps/api/dist/main.js"]
