# Hotfix: RolesGuard Authentication Bug

**Data**: 2026-03-20
**Severidade**: 🔴 CRÍTICA
**Status**: ✅ CORRIGIDO

## Problema Identificado

A aplicação estava **crashando em produção** devido a um bug no `RolesGuard` que permitia requisições não autenticadas chegarem aos services, causando o erro:

```
Error: Tenant context not found. This should not happen.
    at TenantContextService.getTenantId()
    at UsersService.findAll()
```

### Causa Raiz

O `RolesGuard` tinha lógica permissiva incorreta:

```typescript
// ❌ CÓDIGO ANTIGO (BUGADO)
if (!requiredRoles || requiredRoles.length === 0) {
  return true;  // Permitia acesso SEM verificar autenticação!
}

const { user } = context.switchToHttp().getRequest();
if (!user) {
  throw new UnauthorizedException(...);
}
```

**Problema**: Se uma rota não tivesse decorator `@Roles()`, o guard retornava `true` ANTES de verificar se havia usuário autenticado.

### Fluxo do Bug

1. Health checker/bot faz `GET /api/v1/users` sem JWT
2. `JwtAuthGuard` (global) → FALHA mas retorna false ao invés de lançar exceção
3. `RolesGuard` (global) → Como `@Get()` tem `@Roles('admin', 'manager')`, deveria verificar user... MAS o bug permitia passar
4. Request chega ao `UsersService.findAll()`
5. Service chama `getTenantId()` → **contexto não existe** → ❌ ERRO
6. Erro se repete várias vezes por segundo
7. Aplicação falha health check do Railway → **DOWN**

## Solução Implementada

### Correção no RolesGuard

Movida a verificação de autenticação para ANTES da verificação de roles:

```typescript
// ✅ CÓDIGO NOVO (CORRIGIDO)
// 1. Verificar se é pública
if (isPublic) {
  return true;
}

// 2. CRÍTICO: Verificar autenticação PRIMEIRO
const { user } = context.switchToHttp().getRequest();
if (!user) {
  throw new UnauthorizedException('Autenticação necessária...');
}

// 3. Só então verificar roles
const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [...]);
if (!requiredRoles || requiredRoles.length === 0) {
  return true;  // OK, pois já verificamos autenticação acima
}
```

### Mudanças de Comportamento

**Antes:**
- Rotas sem `@Roles()` → ✅ Acesso público (BUG!)
- Rotas com `@Roles()` → ✅ Verifica autenticação + roles

**Depois:**
- Rotas sem `@Public()` → ❌ Requer autenticação (sempre!)
- Rotas com `@Public()` → ✅ Acesso público (correto)
- Rotas com `@Roles()` → ❌ Requer autenticação + roles específicas

## Commits & Deploy

### Commit 1: RolesGuard Fix
**SHA**: `d1267d9`
```bash
git commit -m "fix: corrigir RolesGuard para bloquear requests não autenticados"
```

### Commit 2: JwtAuthGuard Fix (CRÍTICO!)
**SHA**: `7ba2916`
```bash
git commit -m "fix: adicionar handleRequest no JwtAuthGuard para garantir exceção"
```

**Problema adicional descoberto**: O `JwtAuthGuard` estava retornando `false` sem lançar exceção quando não havia JWT, permitindo que a request continuasse para o próximo guard.

**Solução**: Implementado método `handleRequest()` que **SEMPRE** lança `UnauthorizedException` quando não há usuário autenticado.

**Deploy**: Railway detectará automaticamente e fará redeploy em ~2-3 minutos

## Verificação Pós-Deploy

Após o deploy, verificar que:

1. ✅ Health check responde: `curl https://solid-services-api-production.up.railway.app/health`
2. ❌ Endpoint protegido bloqueia sem auth:
   ```bash
   curl -X GET https://solid-services-api-production.up.railway.app/api/v1/users
   # Esperado: 401 Unauthorized (não mais "Tenant context not found")
   ```
3. ✅ Endpoint protegido funciona com JWT válido:
   ```bash
   curl -X GET https://solid-services-api-production.up.railway.app/api/v1/users \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   # Esperado: 200 OK com lista de usuários
   ```

## Lições Aprendidas

1. **Guards devem bloquear por padrão**: Autenticação deve ser SEMPRE verificada primeiro, exceto em rotas explicitamente públicas
2. **Ordem de verificação importa**: Autenticação → Autorização (roles) → Lógica de negócio
3. **Logs em produção são críticos**: Os erros de "Tenant context not found" eram um sintoma, não a causa raiz
4. **Health checks são sensíveis**: Erros não tratados podem derrubar a aplicação toda

## Arquivos Modificados

- `apps/api/src/core/auth/guards/roles.guard.ts` - Correção principal
- `HOTFIX-ROLESGUARD.md` - Este documento

## Monitoramento

Após deploy, monitorar logs do Railway por 10-15 minutos para confirmar que:
- ✅ Não há mais erros "Tenant context not found"
- ✅ Requests não autenticados retornam 401 (não crasham)
- ✅ Health check permanece verde
