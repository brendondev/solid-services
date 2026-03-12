# 🚀 Guia de Setup - Solid Service ERP

Este guia vai te ajudar a rodar o projeto localmente em poucos minutos.

## 📋 Pré-requisitos

Certifique-se de ter instalado:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm 9+** (vem com Node.js)
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** ([Download](https://git-scm.com/))

### Verificar instalação

```bash
node --version    # Deve ser >= 18
npm --version     # Deve ser >= 9
docker --version  # Qualquer versão recente
```

---

## 🛠️ Passo a Passo

### 1. Clonar o Repositório (se ainda não clonou)

```bash
git clone <url-do-repositorio>
cd solid-service
```

### 2. Instalar Dependências

```bash
npm install
```

Isso vai instalar as dependências do monorepo inteiro (root, api e database).

### 3. Iniciar Serviços com Docker

```bash
docker-compose up -d
```

Isso vai iniciar:
- PostgreSQL (porta 5432)
- Redis (porta 6379)
- MinIO (portas 9000 e 9001)

**Aguarde cerca de 10 segundos** para os serviços ficarem prontos.

### 4. Verificar Status do Docker

```bash
docker-compose ps
```

Todos os containers devem estar com status "Up" e "healthy".

### 5. Configurar Banco de Dados

```bash
cd packages/database
npx prisma generate
npx prisma migrate dev --name init
```

Quando perguntado, pressione Enter para aceitar.

### 6. Popular Banco com Dados de Teste (Seed)

```bash
npm run db:seed
```

Isso vai criar:
- 1 tenant demo (demo-company)
- 2 usuários (admin e técnico)
- Clientes de exemplo
- Serviços de exemplo
- Orçamentos e ordens de serviço de exemplo

### 7. Voltar para Raiz e Iniciar Servidor

```bash
cd ../..
npm run dev
```

Aguarde a mensagem:
```
🚀 API running on: http://localhost:3000
📚 API docs: http://localhost:3000/api/docs
```

---

## 🎉 Pronto! Agora você pode testar

### Acessar a Documentação da API (Swagger)

Abra no navegador: **http://localhost:3000/api/docs**

### Fazer Login

**POST** `http://localhost:3000/api/v1/auth/login`

**Body (JSON):**
```json
{
  "email": "admin@democompany.com",
  "password": "admin123"
}
```

**Resposta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "admin@democompany.com",
    "name": "Admin User",
    "roles": ["admin"],
    "tenantId": "...",
    "tenantSlug": "demo-company"
  }
}
```

### Listar Clientes (com Autenticação)

**GET** `http://localhost:3000/api/v1/customers`

**Header:**
```
Authorization: Bearer <seu-access-token>
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "...",
      "name": "Maria Santos",
      "type": "individual",
      "status": "active",
      "contacts": [...],
      "addresses": [...]
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## 🧪 Testando com cURL

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@democompany.com","password":"admin123"}'
```

### Listar Clientes
```bash
# Substitua TOKEN pelo accessToken recebido no login
curl http://localhost:3000/api/v1/customers \
  -H "Authorization: Bearer TOKEN"
```

### Criar Cliente
```bash
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Cliente",
    "type": "individual",
    "document": "111.222.333-44",
    "contacts": [
      {
        "name": "Contato Principal",
        "phone": "(11) 99999-9999",
        "email": "contato@email.com",
        "isPrimary": true
      }
    ]
  }'
```

---

## 🔧 Comandos Úteis

### Docker

```bash
# Ver logs dos containers
docker-compose logs -f

# Parar containers
docker-compose down

# Parar e remover volumes (CUIDADO: deleta dados!)
docker-compose down -v

# Reiniciar um serviço específico
docker-compose restart postgres
```

### Banco de Dados

```bash
cd packages/database

# Ver banco de dados no Prisma Studio
npx prisma studio

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Resetar banco (CUIDADO: deleta tudo!)
npx prisma migrate reset

# Apenas rodar seed novamente
npm run db:seed
```

### API

```bash
# Rodar testes
npm test

# Rodar testes de isolamento de tenant (IMPORTANTE!)
npm test tenant-isolation

# Build de produção
npm run build

# Lint
npm run lint
```

---

## 🌐 URLs Importantes

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **API** | http://localhost:3000 | - |
| **Swagger Docs** | http://localhost:3000/api/docs | - |
| **Prisma Studio** | http://localhost:5555 | - |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin |
| **PostgreSQL** | localhost:5432 | solid_service / solid_service_dev |
| **Redis** | localhost:6379 | - |

---

## 👤 Credenciais de Demonstração

### Admin
- **Email:** admin@democompany.com
- **Senha:** admin123
- **Roles:** admin

### Técnico
- **Email:** tecnico@democompany.com
- **Senha:** tecnico123
- **Roles:** technician

### Tenant
- **Slug:** demo-company
- **Name:** Demo Company - Serviços Técnicos

---

## 🐛 Troubleshooting

### Erro: "Port 5432 already in use"

Você já tem PostgreSQL rodando localmente. Opções:
1. Parar o PostgreSQL local
2. Mudar a porta no docker-compose.yml

### Erro: "Cannot connect to database"

1. Certifique-se que o Docker está rodando
2. Aguarde 10-15 segundos após `docker-compose up`
3. Verifique logs: `docker-compose logs postgres`

### Erro: "Module not found"

```bash
# Limpar e reinstalar
rm -rf node_modules
npm install
```

### Erro no Seed: "Cannot find module 'bcrypt'"

```bash
cd packages/database
npm install bcrypt --save
cd ../..
```

### Resetar Tudo e Começar do Zero

```bash
# Parar e limpar Docker
docker-compose down -v

# Limpar node_modules
rm -rf node_modules packages/*/node_modules apps/*/node_modules

# Reinstalar
npm install

# Subir Docker novamente
docker-compose up -d

# Aguardar 10 segundos
sleep 10

# Refazer migrations e seed
cd packages/database
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
cd ../..

# Iniciar API
npm run dev
```

---

## 📚 Próximos Passos

1. Explorar a API via Swagger: http://localhost:3000/api/docs
2. Testar endpoints de clientes
3. Testar criação de novos tenants via `/auth/register`
4. Ver dados no Prisma Studio
5. Implementar novos módulos (Services, Quotations, etc)

---

## 💡 Dicas

- Use o Swagger UI para testar rapidamente os endpoints
- O Prisma Studio é excelente para visualizar e editar dados
- Todos os endpoints (exceto `/auth/*`) requerem autenticação
- O tenant é extraído automaticamente do JWT token
- Para desenvolvimento, você pode passar `X-Tenant-ID` no header

---

## 🆘 Precisa de Ajuda?

- Veja os logs da API: `npm run dev` (já mostra os logs)
- Veja os logs do Docker: `docker-compose logs -f`
- Verifique o schema do Prisma: `packages/database/prisma/schema.prisma`
- Consulte a documentação do NestJS: https://docs.nestjs.com

---

**Desenvolvido com ❤️ seguindo princípios SOLID**
