#!/bin/bash

# Script para resetar o ambiente de desenvolvimento
# CUIDADO: Isso irá deletar TODOS os dados!
# Uso: ./scripts/dev-reset.sh

set -e

echo "⚠️  WARNING: This will DELETE ALL DATA!"
echo "====================================="
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "🗑️  Resetting development environment..."
echo ""

# Parar e remover containers e volumes
echo "🐳 Stopping and removing Docker containers..."
docker-compose down -v
echo "✅ Containers removed"
echo ""

# Recriar containers
echo "📦 Starting fresh Docker containers..."
docker-compose up -d
echo "✅ Containers started"
echo ""

# Aguardar serviços ficarem prontos
echo "⏳ Waiting for services to be ready..."
sleep 10
echo ""

# Resetar banco de dados
echo "🗃️  Resetting database..."
cd packages/database
npx prisma migrate reset --force
echo "✅ Database reset completed"
echo ""

# Voltar para raiz
cd ../..

echo "✅ Reset completed successfully!"
echo ""
echo "Run 'npm run dev' to start development servers"
