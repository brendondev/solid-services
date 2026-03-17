# Testes de Segurança - Solid Service

Este documento contém instruções para testar as correções de segurança implementadas no sistema.

## Resumo das Correções Implementadas

| # | Vulnerabilidade | Severidade | Status |
|---|-----------------|------------|--------|
| 1 | Endpoints debug/seed públicos em produção | CRÍTICO | Corrigido |
| 2 | Prisma middleware permite queries sem tenant | CRÍTICO | Corrigido |
| 3 | CORS aceita qualquer subdomínio Vercel | CRÍTICO | Corrigido |
| 4 | Console.logs vazam informações em produção | ALTO | Corrigido |
| 5 | Auth sem rate limiting específico | ALTO | Corrigido |

---

## 1. Teste: Endpoints Debug/Seed Bloqueados em Produção

### O que foi corrigido
- Controllers de debug e seed não são carregados em produção
- Defesa em profundidade: verificação adicional em cada método

### Como testar

**Em desenvolvimento (deve funcionar):**
```bash
# Definir ambiente como development
export NODE_ENV=development

# Testar endpoint de seed
curl -X POST http://localhost:3000/api/v1/dev/seed

# Deve retornar: { "success": true, ... }
```

**Em produção (deve bloquear):**
```bash
# Definir ambiente como production
export NODE_ENV=production

# Reiniciar servidor

# Testar endpoint de seed
curl -X POST http://localhost:3000/api/v1/dev/seed

# Deve retornar: 404 Not Found (controller não carregado)
# OU 403 Forbidden (defesa em profundidade)
```

### Verificação no código
```typescript
// app.module.ts - Controllers não carregados em produção
if (process.env.NODE_ENV !== 'production') {
  devControllers.push(SeedController, DebugController);
}

// seed.controller.ts - Verificação adicional
private checkDevEnvironment() {
  if (process.env.NODE_ENV === 'production') {
    throw new ForbiddenException('Seed endpoints disabled in production');
  }
}
```

---

## 2. Teste: Prisma Rejeita Queries sem Tenant

### O que foi corrigido
- Em produção, queries sem tenant context lançam ForbiddenException
- Método `withoutTenant()` para operações administrativas controladas

### Como testar

**Simulação de ataque (em produção):**
```bash
# Se alguém tentar acessar dados sem autenticação válida
curl http://localhost:3000/api/v1/customers

# Resultado esperado: 401 Unauthorized (JWT inválido)
# Se JWT válido mas sem tenant: 403 Forbidden
```

**Verificação de logs:**
```bash
# Em desenvolvimento, você verá warnings:
[SECURITY WARNING] Query without tenant: customer.findMany - Only allowed in development

# Em produção, erro 403 será retornado
```

### Verificação no código
```typescript
// prisma.service.ts
if (!tenantId) {
  if (this.isProduction) {
    throw new ForbiddenException(
      `[SECURITY] Query blocked: ${params.model}.${params.action} - No tenant context`
    );
  }
  // Dev: apenas warning
  console.warn(`[SECURITY WARNING] Query without tenant...`);
}
```

---

## 3. Teste: CORS Whitelist Específica

### O que foi corrigido
- Removida regex `/\.vercel\.app$/` que permitia qualquer subdomínio
- Implementada whitelist específica com variáveis de ambiente

### Como testar

**Configuração de ambiente:**
```bash
# .env
WEB_URL=https://meu-app.vercel.app
CORS_ALLOWED_ORIGINS=https://admin.meu-app.com,https://portal.meu-app.com
```

**Teste de origem permitida:**
```bash
curl -H "Origin: https://meu-app.vercel.app" \
     -X OPTIONS \
     http://localhost:3000/api/v1/customers

# Headers de resposta devem incluir:
# Access-Control-Allow-Origin: https://meu-app.vercel.app
```

**Teste de origem bloqueada (em produção):**
```bash
curl -H "Origin: https://malicious.vercel.app" \
     -X OPTIONS \
     http://localhost:3000/api/v1/customers

# Deve retornar erro CORS ou sem header Access-Control-Allow-Origin
# Log: [SECURITY] CORS blocked origin: https://malicious.vercel.app
```

### Verificação no código
```typescript
// main.ts
app.enableCors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV === 'production') {
      console.error(`[SECURITY] CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
});
```

---

## 4. Teste: Console.logs Removidos em Produção

### O que foi corrigido
- Logs sensíveis condicionados a `NODE_ENV !== 'production'`
- Informações de tenant e usuário não vazam em produção

### Como testar

**Em desenvolvimento:**
```bash
NODE_ENV=development npm run start

# Logs visíveis:
# [JwtStrategy] Validating token for user: xxx
# API running on port 3000
```

**Em produção:**
```bash
NODE_ENV=production npm run start

# Logs NÃO visíveis:
# (nenhum log de debug)
```

### Arquivos corrigidos
- `jwt.strategy.ts` - Logs de validação de token
- `tenant-context.interceptor.ts` - Logs de contexto
- `prisma.service.ts` - Logs de queries
- `main.ts` - Logs de inicialização

---

## 5. Teste: Rate Limiting em Auth

### O que foi corrigido
- Login: 5 tentativas por minuto
- Register: 3 tentativas por minuto
- Refresh: 10 tentativas por minuto

### Como testar

**Teste de brute force (login):**
```bash
# Script para testar rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\n%{http_code}\n"
  sleep 0.5
done

# Resultados esperados:
# Tentativas 1-5: 401 Unauthorized (credenciais inválidas)
# Tentativas 6+: 429 Too Many Requests
```

**Verificação de resposta 429:**
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

### Verificação no código
```typescript
// auth.controller.ts
@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5/min
async login() { ... }

@Throttle({ default: { limit: 3, ttl: 60000 } }) // 3/min
async register() { ... }

@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10/min
async refresh() { ... }
```

---

## Checklist de Deploy Seguro

Antes de fazer deploy em produção, verifique:

- [ ] `NODE_ENV=production` está definido
- [ ] `JWT_SECRET` é uma string longa e aleatória (mínimo 32 caracteres)
- [ ] `WEB_URL` aponta para o domínio correto do frontend
- [ ] `CORS_ALLOWED_ORIGINS` contém apenas domínios autorizados
- [ ] Banco de dados tem backup configurado
- [ ] HTTPS está habilitado
- [ ] Logs de erro estão sendo monitorados (Sentry, etc.)

## Variáveis de Ambiente de Segurança

```bash
# Obrigatórias
NODE_ENV=production
JWT_SECRET=sua-chave-secreta-muito-longa-e-aleatoria-min-32-chars
DATABASE_URL=postgresql://...

# Opcionais mas recomendadas
WEB_URL=https://seu-app.com
CORS_ALLOWED_ORIGINS=https://admin.seu-app.com,https://portal.seu-app.com
JWT_EXPIRES_IN=8h
REFRESH_TOKEN_EXPIRES_IN=7d
```

## Próximos Passos de Segurança (Recomendados)

1. **Implementar HTTPOnly Cookies** para tokens (previne XSS)
2. **Adicionar CSRF Protection** (já que usamos cookies)
3. **Implementar Token Blacklist** para logout/revogação
4. **Adicionar 2FA** para contas administrativas
5. **Implementar Audit Log** mais detalhado
6. **Configurar WAF** (Web Application Firewall)
7. **Executar Pentest** profissional

---

## Contato

Em caso de vulnerabilidades encontradas, entre em contato imediatamente com a equipe de desenvolvimento.

---

*Documento gerado em: Março 2026*
*Versão: 1.0*
