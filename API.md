# Documentação da API - Solid Service

**Versão:** 1.0.0
**Última atualização:** 13/03/2026

---

## 📋 Visão Geral

API RESTful multi-tenant construída com NestJS, PostgreSQL e Prisma ORM.

**Base URL:**
- Desenvolvimento: `http://localhost:3000/api/v1`
- Produção: `https://solid-service.up.railway.app/api/v1`

**Swagger Docs:**
- Desenvolvimento: `http://localhost:3000/api/docs`
- Produção: `https://solid-service.up.railway.app/api/docs`

---

## 🔐 Autenticação

### Fluxo de Autenticação

A API usa **JWT (JSON Web Tokens)** com refresh tokens.

**Headers necessários:**

```http
Authorization: Bearer <access-token>
X-Tenant-ID: <tenant-id>
```

### 1. Registrar Novo Tenant

Cria um novo tenant (empresa) e um usuário admin.

```http
POST /api/v1/auth/register
Content-Type: application/json
```

**Request Body:**

```json
{
  "tenantName": "Minha Empresa Ltda",
  "tenantSlug": "minha-empresa",
  "adminName": "João Silva",
  "adminEmail": "admin@minhaempresa.com",
  "password": "SenhaForte@123"
}
```

**Response (201 Created):**

```json
{
  "tenant": {
    "id": "uuid-tenant",
    "slug": "minha-empresa",
    "name": "Minha Empresa Ltda"
  },
  "user": {
    "id": "uuid-user",
    "email": "admin@minhaempresa.com",
    "name": "João Silva",
    "roles": ["admin"]
  },
  "accessToken": "eyJhbGciOiJIUzI1...",
  "refreshToken": "eyJhbGciOiJIUzI1..."
}
```

### 2. Login

Autentica usuário existente.

```http
POST /api/v1/auth/login
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "admin@minhaempresa.com",
  "password": "SenhaForte@123"
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "uuid-user",
    "tenantId": "uuid-tenant",
    "email": "admin@minhaempresa.com",
    "name": "João Silva",
    "roles": ["admin"]
  },
  "accessToken": "eyJhbGciOiJIUzI1...",
  "refreshToken": "eyJhbGciOiJIUzI1..."
}
```

**Tokens:**
- `accessToken`: Expira em 15 minutos
- `refreshToken`: Expira em 7 dias

### 3. Refresh Token

Renova access token expirado.

```http
POST /api/v1/auth/refresh
Content-Type: application/json
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1..."
}
```

**Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "refreshToken": "eyJhbGciOiJIUzI1..."
}
```

---

## 🏢 Multi-tenancy

### Como Funciona

Todos os endpoints (exceto `/auth/register` e `/auth/login`) requerem isolamento por tenant.

**Formas de identificar o tenant:**

1. **Header X-Tenant-ID** (recomendado para APIs):
   ```http
   X-Tenant-ID: uuid-tenant
   ```

2. **JWT payload** (automático após login):
   - O token JWT já contém `tenantId`
   - Extraído automaticamente pelo backend

3. **Subdomain** (futuro):
   ```
   https://minha-empresa.solid-service.app
   ```

### Isolamento de Dados

**IMPORTANTE:** Todos os dados são isolados por tenant.

- Cliente do Tenant A **NUNCA** vê dados do Tenant B
- Middleware Prisma injeta `tenantId` automaticamente em todas queries
- Testes automatizados garantem isolamento

**Exemplo:**

```http
GET /api/v1/customers
Authorization: Bearer <token-tenant-A>
# Retorna apenas clientes do Tenant A

GET /api/v1/customers
Authorization: Bearer <token-tenant-B>
# Retorna apenas clientes do Tenant B
```

---

## 👥 Clientes (Customers)

### 1. Listar Clientes

```http
GET /api/v1/customers?page=1&limit=10&search=joão&status=active
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Items por página (padrão: 10)
- `search` (opcional): Busca por nome
- `status` (opcional): `active` ou `inactive`

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "uuid-customer",
      "name": "João Silva",
      "type": "individual",
      "document": "123.456.789-00",
      "status": "active",
      "notes": "Cliente VIP",
      "createdAt": "2026-03-13T10:00:00.000Z",
      "contacts": [
        {
          "id": "uuid-contact",
          "name": "João Silva",
          "phone": "(11) 99999-9999",
          "email": "joao@example.com",
          "isPrimary": true
        }
      ],
      "addresses": [
        {
          "id": "uuid-address",
          "street": "Rua das Flores",
          "number": "123",
          "city": "São Paulo",
          "state": "SP",
          "zipCode": "01234-567",
          "isPrimary": true
        }
      ]
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### 2. Buscar Cliente por ID

```http
GET /api/v1/customers/:id
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "id": "uuid-customer",
  "name": "João Silva",
  "type": "individual",
  "document": "123.456.789-00",
  "status": "active",
  "notes": "Cliente VIP",
  "contacts": [...],
  "addresses": [...]
}
```

### 3. Criar Cliente

```http
POST /api/v1/customers
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Maria Santos",
  "type": "individual",
  "document": "987.654.321-00",
  "status": "active",
  "notes": "Nova cliente",
  "contacts": [
    {
      "name": "Maria Santos",
      "phone": "(11) 98888-8888",
      "email": "maria@example.com",
      "isPrimary": true
    }
  ],
  "addresses": [
    {
      "street": "Av. Paulista",
      "number": "1000",
      "complement": "Apto 101",
      "district": "Bela Vista",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01310-100",
      "isPrimary": true
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "id": "uuid-new-customer",
  "name": "Maria Santos",
  ...
}
```

### 4. Atualizar Cliente

```http
PATCH /api/v1/customers/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (campos opcionais):**

```json
{
  "name": "Maria Santos Silva",
  "status": "inactive",
  "notes": "Cliente inativo temporariamente"
}
```

### 5. Deletar Cliente

```http
DELETE /api/v1/customers/:id
Authorization: Bearer <token>
```

**Permissão:** Apenas `admin`

**Response (200 OK):**

```json
{
  "message": "Cliente removido com sucesso"
}
```

---

## 🛠️ Serviços (Services)

Catálogo de serviços oferecidos pela empresa.

### 1. Listar Serviços

```http
GET /api/v1/services?status=active
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "uuid-service",
      "name": "Instalação de Ar Condicionado",
      "description": "Instalação completa com garantia de 1 ano",
      "defaultPrice": 450.00,
      "estimatedDuration": 120,
      "status": "active"
    }
  ]
}
```

### 2. Criar Serviço

```http
POST /api/v1/services
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Manutenção Preventiva",
  "description": "Manutenção anual completa",
  "defaultPrice": 250.00,
  "estimatedDuration": 60,
  "status": "active"
}
```

---

## 💰 Orçamentos (Quotations)

### 1. Listar Orçamentos

```http
GET /api/v1/quotations?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: `draft`, `sent`, `approved`, `rejected`, `expired`
- `customerId`: Filtrar por cliente

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "uuid-quotation",
      "number": "QT-2026-001",
      "customerId": "uuid-customer",
      "customer": {
        "name": "João Silva"
      },
      "status": "sent",
      "totalAmount": 1200.00,
      "validUntil": "2026-03-20T00:00:00.000Z",
      "items": [
        {
          "id": "uuid-item",
          "serviceId": "uuid-service",
          "service": {
            "name": "Instalação de Ar Condicionado"
          },
          "description": "Split 12.000 BTUs",
          "quantity": 2,
          "unitPrice": 450.00,
          "totalPrice": 900.00,
          "order": 1
        }
      ],
      "createdAt": "2026-03-13T10:00:00.000Z"
    }
  ]
}
```

### 2. Criar Orçamento

```http
POST /api/v1/quotations
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "customerId": "uuid-customer",
  "validUntil": "2026-03-20T00:00:00.000Z",
  "notes": "Desconto especial aplicado",
  "items": [
    {
      "serviceId": "uuid-service",
      "description": "Split 12.000 BTUs",
      "quantity": 2,
      "unitPrice": 450.00,
      "order": 1
    },
    {
      "serviceId": "uuid-service-2",
      "description": "Mão de obra adicional",
      "quantity": 1,
      "unitPrice": 300.00,
      "order": 2
    }
  ]
}
```

**Response (201 Created):**

Retorna orçamento criado com `totalAmount` calculado automaticamente.

### 3. Atualizar Status do Orçamento

```http
PATCH /api/v1/quotations/:id/status/:status
Authorization: Bearer <token>
```

**Parâmetros:**
- `status`: `draft`, `sent`, `approved`, `rejected`

**Workflow:**
```
draft → sent → approved → service order
              ↘ rejected
```

**Response (200 OK):**

```json
{
  "id": "uuid-quotation",
  "status": "approved",
  ...
}
```

### 4. Gerar PDF do Orçamento

```http
GET /api/v1/quotations/:id/pdf
Authorization: Bearer <token>
```

**Response (200 OK):**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="quotation-QT-2026-001.pdf"

<binary-pdf-data>
```

---

## 📋 Ordens de Serviço (Service Orders)

### 1. Listar Ordens

```http
GET /api/v1/service-orders?status=open&assignedTo=uuid-tech
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: `open`, `scheduled`, `in_progress`, `completed`, `cancelled`
- `assignedTo`: ID do técnico
- `scheduledFor`: Data do agendamento (ISO 8601)

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "uuid-order",
      "number": "OS-2026-001",
      "customerId": "uuid-customer",
      "customer": {
        "name": "João Silva"
      },
      "status": "in_progress",
      "assignedTo": "uuid-tech",
      "assignedUser": {
        "name": "Carlos Técnico"
      },
      "scheduledFor": "2026-03-15T14:00:00.000Z",
      "totalAmount": 1200.00,
      "items": [...],
      "timeline": [
        {
          "event": "ORDER_CREATED",
          "description": "Ordem criada",
          "createdAt": "2026-03-13T10:00:00.000Z"
        }
      ],
      "checklists": [
        {
          "title": "Verificar voltagem",
          "isCompleted": true,
          "order": 1
        }
      ]
    }
  ]
}
```

### 2. Criar Ordem a partir de Orçamento

```http
POST /api/v1/service-orders/from-quotation/:quotationId
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "assignedTo": "uuid-tech",
  "scheduledFor": "2026-03-15T14:00:00.000Z",
  "notes": "Cliente solicitou período da tarde"
}
```

**Response (201 Created):**

Cria ordem de serviço com items copiados do orçamento.

### 3. Atualizar Status da Ordem

```http
PATCH /api/v1/service-orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "in_progress",
  "notes": "Técnico iniciou trabalho"
}
```

**Workflow:**
```
open → scheduled → in_progress → completed
                                ↘ cancelled
```

### 4. Adicionar Evento à Timeline

```http
POST /api/v1/service-orders/:id/timeline
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "event": "CUSTOM_EVENT",
  "description": "Cliente solicitou troca de horário"
}
```

### 5. Upload de Anexo

```http
POST /api/v1/service-orders/:id/attachments
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Arquivo (max 10MB)
- `description` (opcional): Descrição do anexo

**Response (201 Created):**

```json
{
  "id": "uuid-attachment",
  "fileName": "foto-instalacao.jpg",
  "fileSize": 2048576,
  "mimeType": "image/jpeg",
  "storageKey": "attachments/uuid-order/uuid-attachment.jpg",
  "url": "https://s3.amazonaws.com/bucket/..."
}
```

### 6. Download de Anexo

```http
GET /api/v1/service-orders/:orderId/attachments/:attachmentId
Authorization: Bearer <token>
```

**Response (200 OK):**

Pre-signed URL com redirecionamento para S3.

---

## 💵 Financeiro (Financial)

### 1. Listar Recebíveis

```http
GET /api/v1/financial/receivables?status=pending
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: `pending`, `partial`, `paid`, `overdue`
- `customerId`: Filtrar por cliente

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "uuid-receivable",
      "serviceOrderId": "uuid-order",
      "serviceOrder": {
        "number": "OS-2026-001"
      },
      "customerId": "uuid-customer",
      "customer": {
        "name": "João Silva"
      },
      "amount": 1200.00,
      "paidAmount": 600.00,
      "status": "partial",
      "dueDate": "2026-03-20T00:00:00.000Z",
      "payments": [
        {
          "id": "uuid-payment",
          "amount": 600.00,
          "method": "pix",
          "paidAt": "2026-03-13T10:00:00.000Z",
          "registeredBy": "uuid-user"
        }
      ]
    }
  ]
}
```

### 2. Registrar Pagamento

```http
POST /api/v1/financial/receivables/:id/payments
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 600.00,
  "method": "pix",
  "paidAt": "2026-03-13T10:00:00.000Z",
  "notes": "Pagamento via PIX"
}
```

**Métodos aceitos:**
- `cash` - Dinheiro
- `pix` - PIX
- `credit_card` - Cartão de crédito
- `debit_card` - Cartão de débito
- `bank_transfer` - Transferência bancária
- `check` - Cheque

**Response (201 Created):**

```json
{
  "payment": {
    "id": "uuid-payment",
    "amount": 600.00,
    "method": "pix",
    "paidAt": "2026-03-13T10:00:00.000Z"
  },
  "receivable": {
    "id": "uuid-receivable",
    "paidAmount": 600.00,
    "status": "partial"
  }
}
```

**Status automático:**
- `paidAmount < amount` → `partial`
- `paidAmount >= amount` → `paid`

### 3. Dashboard Financeiro

```http
GET /api/v1/financial/dashboard
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "summary": {
    "totalPending": 15000.00,
    "totalPaid": 8500.00,
    "totalOverdue": 2300.00
  },
  "byStatus": {
    "pending": 10,
    "partial": 5,
    "paid": 25,
    "overdue": 3
  },
  "upcomingDue": [
    {
      "customerId": "uuid-customer",
      "customerName": "João Silva",
      "amount": 1200.00,
      "dueDate": "2026-03-15"
    }
  ]
}
```

---

## 📊 Dashboard

### 1. Métricas Operacionais

```http
GET /api/v1/dashboard/operational
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "orders": {
    "open": 5,
    "scheduled": 10,
    "in_progress": 3,
    "completed": 125,
    "total": 143
  },
  "quotations": {
    "draft": 2,
    "sent": 8,
    "approved": 15,
    "rejected": 3
  },
  "customers": {
    "active": 45,
    "inactive": 5,
    "total": 50
  }
}
```

### 2. Estatísticas Rápidas

```http
GET /api/v1/dashboard/quick-stats
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "totalRevenue": 125000.00,
  "pendingRevenue": 15000.00,
  "activeCustomers": 45,
  "completedOrders": 125
}
```

### 3. Performance Mensal

```http
GET /api/v1/dashboard/monthly-performance?year=2026&month=3
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "revenue": 25000.00,
  "completedOrders": 35,
  "newCustomers": 8,
  "averageOrderValue": 714.29
}
```

---

## 🔒 Controle de Acesso (RBAC)

### Roles Disponíveis

| Role | Permissões |
|------|------------|
| **admin** | Acesso total, incluindo deleções |
| **manager** | Gerenciar clientes, orçamentos, ordens, financeiro (sem deletar) |
| **technician** | Ver e atualizar ordens atribuídas |
| **viewer** | Apenas visualização |

### Endpoints Protegidos por Role

```typescript
// Apenas admin pode deletar
DELETE /customers/:id
DELETE /quotations/:id
DELETE /service-orders/:id
DELETE /receivables/:id

// Admin e manager podem gerenciar
POST /customers
PATCH /customers/:id
POST /quotations
PATCH /quotations/:id/status/:status

// Todos autenticados podem visualizar
GET /customers
GET /quotations
GET /service-orders
```

**Veja documentação completa em:** [RBAC.md](./RBAC.md)

---

## 🌐 Portal do Cliente

Portal público para clientes acompanharem orçamentos e ordens.

### 1. Validar Token de Acesso

```http
POST /api/v1/customer-portal/validate
Content-Type: application/json
```

**Request Body:**

```json
{
  "token": "cliente-token-uuid"
}
```

**Response (200 OK):**

```json
{
  "customerId": "uuid-customer",
  "customer": {
    "name": "João Silva"
  }
}
```

### 2. Listar Orçamentos Pendentes

```http
GET /api/v1/customer-portal/quotations/:token
```

**Response (200 OK):**

```json
{
  "quotations": [
    {
      "id": "uuid-quotation",
      "number": "QT-2026-001",
      "status": "sent",
      "totalAmount": 1200.00,
      "validUntil": "2026-03-20",
      "items": [...]
    }
  ]
}
```

### 3. Aprovar Orçamento

```http
POST /api/v1/customer-portal/quotations/:quotationId/approve
Content-Type: application/json
```

**Request Body:**

```json
{
  "token": "cliente-token-uuid"
}
```

**Response (200 OK):**

```json
{
  "quotation": {
    "id": "uuid-quotation",
    "status": "approved"
  },
  "message": "Orçamento aprovado com sucesso"
}
```

---

## ⚠️ Tratamento de Erros

### Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Recurso não encontrado |
| 409 | Conflito (duplicação) |
| 422 | Validação falhou |
| 500 | Erro interno do servidor |

### Formato de Erro Padrão

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "email must be a valid email"
    },
    {
      "field": "password",
      "message": "password must be longer than or equal to 8 characters"
    }
  ]
}
```

### Erros Comuns

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Customer not found",
  "error": "Not Found"
}
```

**409 Conflict:**
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

---

## 🚦 Rate Limiting

**Limites:**
- 100 requisições por minuto por tenant
- Aplica-se a todos os endpoints

**Headers de resposta:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1710331200
```

**Erro ao exceder limite (429 Too Many Requests):**

```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Too Many Requests"
}
```

---

## 🔍 Paginação

Todos os endpoints de listagem suportam paginação:

**Query Parameters:**
- `page`: Número da página (padrão: 1)
- `limit`: Items por página (padrão: 10, max: 100)

**Response:**

```json
{
  "data": [...],
  "meta": {
    "total": 156,
    "page": 2,
    "limit": 10,
    "totalPages": 16,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

---

## 📝 Auditoria (Audit Log)

Todos os eventos críticos são registrados automaticamente.

### 1. Listar Logs de Auditoria

```http
GET /api/v1/audit?entity=Customer&action=CREATE&page=1
Authorization: Bearer <token>
```

**Permissão:** Apenas `admin`

**Query Parameters:**
- `entity`: `Customer`, `Quotation`, `ServiceOrder`, `Receivable`
- `action`: `CREATE`, `UPDATE`, `DELETE`, `STATUS_CHANGE`
- `userId`: Filtrar por usuário
- `startDate`, `endDate`: Filtro de data

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "uuid-audit",
      "userId": "uuid-user",
      "user": {
        "name": "Admin User"
      },
      "action": "CREATE",
      "entity": "Customer",
      "entityId": "uuid-customer",
      "changes": {
        "name": "João Silva",
        "type": "individual"
      },
      "ipAddress": "192.168.1.1",
      "createdAt": "2026-03-13T10:00:00.000Z"
    }
  ]
}
```

---

## 📧 Notificações por Email

Sistema de notificações via Resend.

### Eventos que Disparam Emails

1. **Orçamento enviado** → Email para cliente
2. **Orçamento aprovado/rejeitado** → Email para admin
3. **Ordem agendada** → Email para cliente
4. **Ordem concluída** → Email para cliente
5. **Pagamento recebido** → Email para cliente
6. **Acesso ao portal** → Email com link

### Enviar Email de Acesso ao Portal

```http
POST /api/v1/customers/:id/send-portal-access
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "message": "Email sent successfully"
}
```

---

## 🧪 Testando a API

### 1. Via Swagger UI

```
http://localhost:3000/api/docs
```

1. Clique em "Authorize"
2. Cole o Bearer token
3. Teste endpoints interativamente

### 2. Via cURL

```bash
# Registrar tenant
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Teste Ltda",
    "tenantSlug": "teste",
    "adminName": "Admin",
    "adminEmail": "admin@teste.com",
    "password": "senha123"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@teste.com",
    "password": "senha123"
  }'

# Listar clientes
curl -X GET http://localhost:3000/api/v1/customers \
  -H "Authorization: Bearer <seu-token>"
```

### 3. Via Postman

Importe coleção:

```json
{
  "info": {
    "name": "Solid Service API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{accessToken}}",
        "type": "string"
      }
    ]
  }
}
```

---

## 📚 Recursos Adicionais

- **Swagger Docs:** `/api/docs`
- **Health Check:** `/health`
- **RBAC:** [RBAC.md](./RBAC.md)
- **Setup Local:** [SETUP.md](./SETUP.md)
- **Deploy:** [DEPLOY.md](./DEPLOY.md)
- **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🔗 Links Úteis

- **Swagger OpenAPI Spec:** `http://localhost:3000/api/docs-json`
- **Postman Collection:** (exportar via Swagger → Postman)
- **GraphQL (futuro):** Não implementado no MVP

---

**Documentação completa da API! 🚀**
