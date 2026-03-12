# 🚀 Como Rodar o Solid Service Localmente

## ⚡ Quick Start (5 minutos)

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar Docker (PostgreSQL, Redis, MinIO)
docker-compose up -d

# 3. Aguardar serviços ficarem prontos (10 segundos)
# No Windows use timeout, no Linux/Mac use sleep
timeout /t 10  # Windows
# sleep 10     # Linux/Mac

# 4. Configurar banco de dados
cd packages/database
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

# 5. Voltar para raiz e iniciar API
cd ../..
npm run dev
```

**Pronto!** API rodando em http://localhost:3000 🎉

---

## 📚 Testando a API

### 1. Acessar Swagger UI

Abra no navegador: **http://localhost:3000/api/docs**

Você verá toda a documentação interativa da API.

### 2. Fazer Login

**Endpoint:** `POST /api/v1/auth/login`

**No Swagger:**
1. Clique em `/auth/login`
2. Clique em "Try it out"
3. Cole o JSON abaixo
4. Clique em "Execute"

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
  "refreshToken": "...",
  "user": {
    "id": "xxx",
    "email": "admin@democompany.com",
    "name": "Admin User",
    "roles": ["admin"],
    "tenantId": "yyy",
    "tenantSlug": "demo-company"
  }
}
```

**Copie o `accessToken`!**

### 3. Autorizar no Swagger

1. Role até o topo da página
2. Clique no botão **"Authorize"** 🔓
3. Cole o token no campo "Value":
   ```
   Bearer eyJhbGciOiJIUzI1NiIs...
   ```
4. Clique em "Authorize"
5. Clique em "Close"

Agora você pode testar todos os endpoints! 🎉

### 4. Listar Clientes

**Endpoint:** `GET /api/v1/customers`

1. Clique em `/customers`
2. Clique em "Try it out"
3. Clique em "Execute"

**Resposta:**
```json
{
  "data": [
    {
      "id": "...",
      "tenantId": "...",
      "name": "Maria Santos",
      "type": "individual",
      "document": "123.456.789-00",
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

### 5. Criar Novo Cliente

**Endpoint:** `POST /api/v1/customers`

```json
{
  "name": "Pedro Oliveira",
  "type": "individual",
  "document": "999.888.777-66",
  "notes": "Cliente novo de teste",
  "contacts": [
    {
      "name": "Pedro Oliveira",
      "phone": "(11) 98888-7777",
      "email": "pedro@email.com",
      "isPrimary": true
    }
  ],
  "addresses": [
    {
      "street": "Rua das Palmeiras",
      "number": "456",
      "district": "Jardins",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567",
      "isPrimary": true
    }
  ]
}
```

---

## 🧪 Testando com cURL (Terminal)

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@democompany.com\",\"password\":\"admin123\"}"
```

### Listar Clientes
```bash
# Substitua TOKEN pelo accessToken do login
curl http://localhost:3000/api/v1/customers \
  -H "Authorization: Bearer TOKEN"
```

### Criar Cliente
```bash
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Novo Cliente\",\"type\":\"individual\"}"
```

---

## 🎮 Testando com Postman/Insomnia

### 1. Importar Collection

Crie uma nova collection com estas requests:

**Login:**
- Method: POST
- URL: `http://localhost:3000/api/v1/auth/login`
- Body (JSON):
  ```json
  {
    "email": "admin@democompany.com",
    "password": "admin123"
  }
  ```

**Listar Clientes:**
- Method: GET
- URL: `http://localhost:3000/api/v1/customers`
- Headers:
  - `Authorization`: `Bearer <token>`

### 2. Salvar Token

Após fazer login, salve o `accessToken` como variável de ambiente para usar nas outras requests.

---

## 🔍 Explorando os Dados

### Prisma Studio (Recomendado!)

```bash
cd packages/database
npx prisma studio
```

Abre interface visual em: http://localhost:5555

Você pode:
- Ver todos os dados
- Criar/editar/deletar registros
- Explorar relacionamentos

### PostgreSQL Cliente

```bash
# Conectar via psql (se tiver instalado)
psql postgresql://solid_service:solid_service_dev@localhost:5432/solid_service

# Ou via Docker
docker exec -it solid-service-postgres psql -U solid_service -d solid_service
```

---

## 👤 Usuários Demo

### Admin (Acesso Total)
- Email: `admin@democompany.com`
- Senha: `admin123`
- Roles: `["admin"]`

### Técnico (Acesso Limitado)
- Email: `tecnico@democompany.com`
- Senha: `tecnico123`
- Roles: `["technician"]`

### Tenant
- Slug: `demo-company`
- Name: Demo Company - Serviços Técnicos

---

## 📊 Dados Pré-carregados

Após o seed, você terá:
- ✅ 1 tenant (demo-company)
- ✅ 2 usuários (admin + técnico)
- ✅ 2 clientes (Maria Santos + Tech Solutions)
- ✅ 3 serviços do catálogo
- ✅ 1 orçamento
- ✅ 1 ordem de serviço
- ✅ 1 recebível

---

## 🛠️ Comandos Úteis

### Ver logs em tempo real
```bash
npm run dev  # Já mostra logs
```

### Reiniciar apenas a API
```bash
# Ctrl+C para parar
npm run dev  # Iniciar novamente
```

### Ver logs do Docker
```bash
docker-compose logs -f
```

### Resetar banco de dados
```bash
cd packages/database
npx prisma migrate reset  # CUIDADO: Deleta tudo!
npm run db:seed
cd ../..
```

### Parar Docker
```bash
docker-compose down
```

### Limpar tudo e recomeçar
```bash
# Parar Docker
docker-compose down -v

# Limpar node_modules (opcional)
rm -rf node_modules packages/*/node_modules apps/*/node_modules

# Reinstalar
npm install

# Refazer setup
docker-compose up -d
cd packages/database
npx prisma generate
npx prisma migrate dev
npm run db:seed
cd ../..
npm run dev
```

---

## 🌐 URLs de Serviços

| Serviço | URL | Login |
|---------|-----|-------|
| API | http://localhost:3000 | - |
| Swagger | http://localhost:3000/api/docs | - |
| Prisma Studio | http://localhost:5555 | (rodar comando) |
| MinIO Console | http://localhost:9001 | minioadmin/minioadmin |
| PostgreSQL | localhost:5432 | solid_service/solid_service_dev |
| Redis | localhost:6379 | - |

---

## 🐛 Problemas Comuns

### "Port 3000 already in use"
Você já tem algo rodando na porta 3000. Pare o serviço ou mude a porta em `.env`:
```
API_PORT=3001
```

### "Cannot connect to database"
1. Verifique se Docker está rodando: `docker ps`
2. Aguarde 10 segundos após `docker-compose up -d`
3. Veja logs: `docker-compose logs postgres`

### "Prisma Client not generated"
```bash
cd packages/database
npx prisma generate
cd ../..
```

### "Module not found"
```bash
rm -rf node_modules
npm install
```

---

## 🎯 Próximos Passos

1. ✅ Explorar API via Swagger
2. ✅ Testar CRUD de clientes
3. ✅ Ver dados no Prisma Studio
4. ⏳ Criar novo tenant via `/auth/register`
5. ⏳ Implementar frontend Next.js
6. ⏳ Adicionar novos módulos (Services, Quotations, etc)

---

## 📖 Documentação Adicional

- **Setup Completo**: [GUIA_SETUP.md](./GUIA_SETUP.md)
- **Progresso**: [PROGRESS.md](./PROGRESS.md)
- **Arquitetura**: [docs/architecture/README.md](./docs/architecture/README.md)
- **README**: [README.md](./README.md)

---

**Desenvolvido com ❤️ seguindo princípios SOLID**

Se tiver dúvidas, consulte o Swagger ou os arquivos de documentação! 🚀
