# Debug: Tenant Context Issue - 2026-03-20

## Problema Original
- **Erro**: "Tenant context not found. This should not happen."
- **Status HTTP**: 500 Internal Server Error
- **Endpoint**: `GET /api/v1/users` (com token válido)
- **Ambiente**: Produção (Railway)

## Investigação Realizada

### 1. Teste de Guards (✅ FUNCIONA)
```bash
# Sem token → 401 Unauthorized
curl GET /api/v1/users
# Retorno: {"message":"Token JWT inválido ou ausente","error":"Unauthorized","statusCode":401}

# Com token → Passa pelo guard mas dá 500
curl -H "Authorization: Bearer TOKEN" GET /api/v1/users
# Retorno: {"statusCode":500,"message":"Internal server error"}
```

**Conclusão**: JwtAuthGuard e RolesGuard estão funcionando perfeitamente.

### 2. Ordem de Execução Correta
```
1. JwtAuthGuard → JwtStrategy.validate()
2. RolesGuard → Verifica roles do user
3. TenantContextInterceptor → Cria contexto AsyncLocal
4. Controller/Service → Executa lógica
```

### 3. Correção #1 - withoutTenant() na JwtStrategy
**Problema**: JwtStrategy executava ANTES do interceptor, mas o middleware Prisma exigia contexto.

**Solução**: Usar `prisma.withoutTenant()` para bypass do middleware.

```typescript
// ANTES (causava erro em produção)
const user = await this.prisma.user.findFirst({...});

// DEPOIS (funciona)
const user = await this.prisma.withoutTenant(async () => {
  return await this.prisma.user.findFirst({...});
});
```

**Commits**:
- `1aa5864` - Primeira tentativa (arrow function implícita)
- `1665490` - Segunda tentativa (async/await explícito)

**Status**: ✅ Aplicado, mas erro persiste!

### 4. Novo Diagnóstico - AsyncLocalStorage
**Hipótese Atual**: O contexto AsyncLocal não está sendo mantido através da promise chain do Observable.

**Evidência**:
- Registro (`POST /api/v1/auth/register`) funciona perfeitamente
- Login funciona perfeitamente
- Mas `GET /api/v1/users` com token válido dá 500

**Diferença**:
- `/register` e `/login` NÃO usam o TenantContextInterceptor (rotas públicas)
- `/users` DEPENDE do interceptor criar o contexto

### 5. Logs de Debug Adicionados
Para investigar se o problema é no Observable/AsyncLocalStorage:

**TenantContextInterceptor**:
```typescript
console.log('[TenantContextInterceptor] User:', user);
console.log('[TenantContextInterceptor] Context created for tenant:', user.tenantId);
console.error('[TenantContextInterceptor] Error during execution:', err.message);
```

**TenantContextService**:
```typescript
console.log('[TenantContextService] getStore():', context);
```

**Commit**: `b095df9` - Logs temporários para investigação

## Próximos Passos

1. **Verificar logs do Railway** após deploy `b095df9`
2. **Analisar output** dos console.logs para identificar:
   - O `user` está sendo passado corretamente?
   - O contexto está sendo criado dentro do `.run()`?
   - O contexto está sendo perdido no `.subscribe()`?

3. **Possíveis soluções se problema for AsyncLocalStorage + Observable**:
   - Opção A: Usar middleware Express ao invés de interceptor NestJS
   - Opção B: Usar estratégia diferente (cls-hooked, request-context)
   - Opção C: Passar tenantId explicitamente nos services

## Referências
- https://nodejs.org/api/async_context.html#class-asynclocalstorage
- https://github.com/Jeff-Lewis/cls-hooked/issues/98
- https://docs.nestjs.com/interceptors

## Status Atual
🔴 **BLOQUEADO** - Aguardando logs do Railway para próxima ação
