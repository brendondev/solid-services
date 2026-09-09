# syntax=docker/dockerfile:1

# ============================================================================
# Solid Service - Web (Next.js)
# Build context = raiz do monorepo:  docker build -f apps/web/Dockerfile .
#
# ATENÇÃO: NEXT_PUBLIC_API_URL é embutida no bundle em tempo de BUILD (o
# navegador do usuário é quem chama a API). Trocar a URL exige rebuild da
# imagem, não basta mudar a env em runtime.
# ============================================================================

FROM node:22-bookworm-slim AS base
ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false
WORKDIR /app

# ----------------------------------------------------------------------------
# deps
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
# build
# ----------------------------------------------------------------------------
FROM deps AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

COPY tsconfig.json ./
COPY packages/database packages/database
COPY apps/web apps/web
RUN npm run build --workspace @solid-service/web

# ----------------------------------------------------------------------------
# runtime (output standalone: só o necessário para servir o app)
# ----------------------------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001 \
    HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /app/apps/web/public ./apps/web/public

USER node
EXPOSE 3001
CMD ["node", "apps/web/server.js"]
