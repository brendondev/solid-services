#!/bin/sh
# ============================================================================
# Entrypoint da API: aplica as migrations do Prisma e sobe o servidor.
#
# RUN_MIGRATIONS=false pula as migrations (útil quando várias réplicas sobem
# ao mesmo tempo e só uma deve migrar).
# RUN_SEED=true roda o seed depois das migrations (ambiente local/demo).
# ============================================================================
set -e

cd /app

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] Aplicando migrations do Prisma..."
  npx prisma migrate deploy --schema packages/database/prisma/schema.prisma
else
  echo "[entrypoint] RUN_MIGRATIONS=false - migrations ignoradas."
fi

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "[entrypoint] Rodando seed..."
  npx ts-node packages/database/prisma/seed/index.ts
fi

echo "[entrypoint] Iniciando API..."
exec "$@"
