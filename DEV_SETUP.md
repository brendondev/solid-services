# Configuração do Ambiente de Desenvolvimento

## Opção 1: Usar Docker (Recomendado)

### 1. Instalar Docker Desktop
- Windows: https://www.docker.com/products/docker-desktop/
- Após instalação, reiniciar o computador

### 2. Iniciar banco de dados local
```bash
docker compose up -d
```

### 3. Rodar migrations
```bash
cd packages/database
npx prisma migrate dev
npx prisma db seed
```

### 4. Iniciar backend
```bash
cd apps/api
npm run dev
```

---

## Opção 2: Usar Railway (Temporário)

**⚠️ AVISO**: Isso usa o banco de PRODUÇÃO! Use apenas para testes rápidos.

### 1. Obter DATABASE_URL do Railway
- Acesse: https://railway.app/project/seu-projeto
- Vá em: PostgreSQL → Connect → Connection String

### 2. Atualizar `.env`
```bash
# apps/api/.env
DATABASE_URL="postgresql://user:pass@host:port/database"
```

### 3. Iniciar backend
```bash
cd apps/api
npm run dev
```

---

## Opção 3: PostgreSQL Local (Avançado)

### 1. Instalar PostgreSQL
- Windows: https://www.postgresql.org/download/windows/
- Criar banco: `solid_service_dev`
- Usuário: `solid` / Senha: `solid123`

### 2. Configurar `.env`
```bash
DATABASE_URL="postgresql://solid:solid123@localhost:5432/solid_service_dev"
```

### 3. Rodar migrations
```bash
cd packages/database
npx prisma migrate dev
npx prisma db seed
```
