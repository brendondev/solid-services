#!/bin/bash

# Script de setup do ambiente de desenvolvimento
# Uso: ./scripts/dev-setup.sh

set -e

echo "🚀 Solid Service - Development Setup"
echo "====================================="
echo ""

# Verificar se Docker está rodando
echo "🐳 Checking Docker..."
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi
echo "✅ Docker is running"
echo ""

# Iniciar containers
echo "📦 Starting Docker containers..."
docker-compose up -d
echo "✅ Containers started"
echo ""

# Aguardar serviços ficarem prontos
echo "⏳ Waiting for services to be ready..."
sleep 10

# Verificar saúde dos containers
echo "🏥 Checking container health..."
docker-compose ps
echo ""

# Instalar dependências
echo "📥 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Gerar Prisma Client
echo "🔧 Generating Prisma Client..."
cd packages/database
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

# Executar migrations
echo "🗃️  Running database migrations..."
npx prisma migrate dev --name init
echo "✅ Migrations completed"
echo ""

# Executar seed
echo "🌱 Seeding database..."
npm run db:seed
echo "✅ Database seeded"
echo ""

# Voltar para raiz
cd ../..

echo "✅ Setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "  1. Copy .env.example to .env and configure if needed"
echo "  2. Run 'npm run dev' to start development servers"
echo ""
echo "🔗 Services:"
echo "  - API: http://localhost:3000"
echo "  - Web: http://localhost:3001"
echo "  - Postgres: localhost:5432"
echo "  - Redis: localhost:6379"
echo "  - MinIO Console: http://localhost:9001"
echo "  - API Docs: http://localhost:3000/api/docs"
echo ""
echo "👤 Demo credentials:"
echo "  - Admin: admin@democompany.com / admin123"
echo "  - Technician: tecnico@democompany.com / tecnico123"
