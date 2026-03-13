# RBAC - Controle de Acesso Baseado em Roles

**Data:** 13/03/2026
**Status:** ✅ Implementado

---

## 📋 Roles Disponíveis

O sistema suporta 4 níveis de acesso:

### 1. **Admin**
- Acesso total ao sistema
- Pode deletar recursos críticos
- Gerenciar usuários e configurações

### 2. **Manager**
- Gerenciar clientes, orçamentos, ordens
- Gerenciar financeiro
- Não pode deletar recursos ou gerenciar usuários

### 3. **Technician**
- Ver e atualizar ordens atribuídas
- Visualizar clientes relacionados às suas ordens
- Não pode criar/deletar orçamentos ou clientes

### 4. **Viewer**
- Apenas visualização
- Acesso read-only a todas entidades
- Não pode criar, editar ou deletar

---

## 🔐 Implementação Técnica

### Backend (NestJS)

**RolesGuard** (`apps/api/src/core/auth/guards/roles.guard.ts`)
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Sem restrição
    }

    const { user } = context.switchToHttp().getRequest();

    // Verifica se usuário tem pelo menos uma das roles
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

**Decorator @Roles()** (`apps/api/src/core/auth/decorators/roles.decorator.ts`)
```typescript
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

**Uso nos Controllers:**
```typescript
@Delete(':id')
@Roles('admin', 'manager')
remove(@Param('id') id: string) {
  // Apenas admin ou manager podem deletar
}
```

---

## 📊 Matriz de Permissões

| Recurso | Criar | Ler | Editar | Deletar |
|---------|-------|-----|--------|---------|
| **Customers** |
| Admin | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ✅ | ✅ |
| Technician | ❌ | ✅* | ❌ | ❌ |
| Viewer | ❌ | ✅ | ❌ | ❌ |
| **Quotations** |
| Admin | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ✅ | ✅ |
| Technician | ❌ | ✅ | ❌ | ❌ |
| Viewer | ❌ | ✅ | ❌ | ❌ |
| **Service Orders** |
| Admin | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ✅ | ✅ |
| Technician | ❌ | ✅* | ✅* | ❌ |
| Viewer | ❌ | ✅ | ❌ | ❌ |
| **Financial** |
| Admin | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ✅ | ❌ |
| Technician | ❌ | ❌ | ❌ | ❌ |
| Viewer | ❌ | ✅ | ❌ | ❌ |
| **Users** |
| Admin | ✅ | ✅ | ✅ | ✅ |
| Manager | ❌ | ✅ | ❌ | ❌ |
| Technician | ❌ | ❌ | ❌ | ❌ |
| Viewer | ❌ | ❌ | ❌ | ❌ |

\* Apenas recursos atribuídos ao técnico

---

## 🎯 Endpoints Protegidos

### Customers
```typescript
@Delete(':id')
@Roles('admin')  // Apenas admin pode deletar clientes
```

### Quotations
```typescript
@Delete(':id')
@Roles('admin', 'manager')  // Admin ou manager
```

### Service Orders
```typescript
@Delete(':id')
@Roles('admin')  // Apenas admin pode deletar ordens

@Patch(':id/complete')
@Roles('admin', 'manager', 'technician')  // Técnico pode completar suas ordens
```

### Financial
```typescript
@Delete(':id')
@Roles('admin')  // Apenas admin pode deletar recebíveis

@Post()
@Roles('admin', 'manager')  // Admin ou manager podem criar
```

---

## 🔧 Como Usar

### 1. Proteger um endpoint
```typescript
import { Roles } from '@core/auth';

@Controller('customers')
export class CustomersController {

  @Post()
  @Roles('admin', 'manager')  // Permite admin OU manager
  create(@Body() dto: CreateCustomerDto) {
    // ...
  }

  @Delete(':id')
  @Roles('admin')  // Apenas admin
  remove(@Param('id') id: string) {
    // ...
  }
}
```

### 2. Guard aplicado globalmente
O `RolesGuard` está registrado como `APP_GUARD` no `app.module.ts`, então é aplicado automaticamente em todas as rotas.

```typescript
// app.module.ts
providers: [
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
]
```

### 3. Rotas sem restrição
Se um endpoint **não** tiver o decorator `@Roles()`, qualquer usuário autenticado pode acessar.

```typescript
@Get()
findAll() {
  // Qualquer usuário autenticado pode acessar
}
```

---

## 🧪 Testando Permissões

### 1. Criar usuário com role específica
```typescript
// Seed ou manual via Prisma
await prisma.user.create({
  data: {
    email: 'tech@example.com',
    passwordHash: await bcrypt.hash('password', 10),
    name: 'Técnico João',
    roles: ['technician'],
    tenantId: 'tenant-123',
  },
});
```

### 2. Login e obter JWT
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "tech@example.com", "password": "password"}'
```

### 3. Testar endpoint protegido
```bash
# Deve retornar 403 se role não permitida
curl -X DELETE http://localhost:3000/api/v1/customers/123 \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Resposta esperada (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Acesso negado. Roles necessárias: admin. Suas roles: technician"
}
```

---

## 📱 Frontend - Esconder Ações por Role

### Hook useAuth (a implementar)
```typescript
// apps/web/src/hooks/useAuth.ts
export function useAuth() {
  const user = // ... obter do JWT decodificado

  const hasRole = (role: string) => {
    return user?.roles?.includes(role);
  };

  const hasAnyRole = (...roles: string[]) => {
    return roles.some(role => user?.roles?.includes(role));
  };

  return { user, hasRole, hasAnyRole };
}
```

### Componentes condicionais
```typescript
function CustomersList() {
  const { hasRole } = useAuth();

  return (
    <div>
      <h1>Clientes</h1>

      {hasRole('admin') || hasRole('manager') && (
        <Button onClick={handleCreate}>Criar Cliente</Button>
      )}

      <Table>
        {customers.map(customer => (
          <tr key={customer.id}>
            <td>{customer.name}</td>
            <td>
              {/* Apenas admin pode deletar */}
              {hasRole('admin') && (
                <Button onClick={() => handleDelete(customer.id)}>
                  Deletar
                </Button>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
```

---

## ✅ Checklist de Implementação

### Backend
- [x] RolesGuard criado
- [x] Decorator @Roles() criado
- [x] Guard registrado globalmente
- [x] Endpoints críticos protegidos
  - [x] DELETE /customers/:id (admin)
  - [x] DELETE /quotations/:id (admin, manager)
  - [x] DELETE /service-orders/:id (admin)
  - [x] DELETE /receivables/:id (admin)

### Frontend (Pendente)
- [ ] Criar hook useAuth
- [ ] Decodificar JWT para pegar roles
- [ ] Esconder botões/ações baseado em role
- [ ] Mostrar mensagem de erro clara ao tentar ação sem permissão

---

## 🚀 Próximos Passos

1. **Frontend:**
   - Implementar hook useAuth
   - Esconder ações baseado em roles
   - Mostrar feedback visual de permissões

2. **Backend:**
   - Adicionar mais granularidade (ex: técnico só edita ordens atribuídas)
   - Implementar permissões customizadas por tenant

3. **Documentação:**
   - Swagger: documentar roles necessárias em cada endpoint
   - README: guia de gerenciamento de usuários e roles

---

## 📚 Referências

- [NestJS Guards](https://docs.nestjs.com/guards)
- [NestJS Custom Decorators](https://docs.nestjs.com/custom-decorators)
- [JWT Roles](https://jwt.io/)
