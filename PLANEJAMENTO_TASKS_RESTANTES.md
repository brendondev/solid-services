# Planejamento - Tasks Restantes do MVP

**Data:** 13/03/2026
**Progresso:** 31/39 tasks concluídas (79%)

---

## 📋 Tasks Pendentes (8)

### #23: Implementar Portal do Cliente
**Prioridade:** Alta
**Estimativa:** 3-4 horas

**Descrição:**
Portal público para clientes acompanharem suas ordens e aprovarem orçamentos.

**Escopo:**
- Rota pública (sem autenticação JWT padrão)
- Acesso via token único por cliente
- Visualização de orçamentos pendentes
- Aprovação/rejeição de orçamentos
- Visualização de ordens em andamento
- Histórico de serviços

**Backend:**
- [ ] Gerar token de acesso para clientes
- [ ] Endpoint público para validar token
- [ ] Endpoints de orçamentos (read-only + ações)
- [ ] Endpoints de ordens (read-only)
- [ ] Histórico de serviços do cliente

**Frontend:**
- [ ] Página de acesso (validação de token)
- [ ] Dashboard do cliente
- [ ] Lista de orçamentos pendentes
- [ ] Visualização de ordem em andamento
- [ ] Histórico de serviços

---

### #24: Implementar Sistema de Notificações por Email
**Prioridade:** Alta
**Estimativa:** 2-3 horas

**Descrição:**
Sistema de notificações por email usando templates profissionais.

**Escopo:**
- Envio de emails transacionais
- Templates em HTML (Handlebars)
- Integração com provedores (SendGrid, AWS SES, SMTP)

**Emails a implementar:**
- [ ] Orçamento enviado ao cliente
- [ ] Ordem de serviço criada
- [ ] Ordem agendada (lembrete)
- [ ] Ordem concluída
- [ ] Pagamento recebido

**Implementação:**
- [ ] Instalar nodemailer + handlebars
- [ ] Criar EmailService (core/notifications)
- [ ] Criar templates de email
- [ ] Integrar em módulos relevantes
- [ ] Configurar via env vars

---

### #25: Implementar RBAC (Perfis e Permissões)
**Prioridade:** Média
**Estimativa:** 3-4 horas

**Descrição:**
Sistema de controle de acesso baseado em roles.

**Roles:**
- **Admin:** Acesso total
- **Manager:** Gerenciar clientes, orçamentos, ordens, financeiro
- **Technician:** Ver/atualizar ordens atribuídas
- **Viewer:** Apenas visualização

**Escopo:**
- [ ] Criar guard de permissões
- [ ] Decorator @RequireRoles()
- [ ] Atualizar endpoints com guards
- [ ] Middleware de validação
- [ ] Frontend: esconder ações por role

**Implementação:**
- [ ] RolesGuard (core/auth)
- [ ] Decorator @Roles()
- [ ] Aplicar em controllers críticos
- [ ] Frontend: useAuth hook com roles
- [ ] Condicional de botões/links

---

### #28: Implementar Audit Log
**Prioridade:** Média
**Estimativa:** 2-3 horas

**Descrição:**
Log de auditoria para rastrear ações importantes.

**Escopo:**
- Registrar ações críticas (CRUD)
- Incluir: usuário, ação, entidade, mudanças, timestamp
- Consulta de logs (admin)

**Eventos a logar:**
- [ ] Criação/edição/exclusão de clientes
- [ ] Mudança de status de orçamentos
- [ ] Criação/conclusão de ordens
- [ ] Registro de pagamentos
- [ ] Upload/deleção de anexos

**Implementação:**
- [ ] AuditLog model (já existe no schema)
- [ ] AuditService (core/audit)
- [ ] Interceptor para log automático
- [ ] Endpoint de consulta (admin only)
- [ ] Frontend: página de logs

---

### #30: Implementar Testes E2E Críticos
**Prioridade:** Baixa
**Estimativa:** 4-5 horas

**Descrição:**
Testes end-to-end dos fluxos principais.

**Fluxos a testar:**
- [ ] Autenticação (login, refresh)
- [ ] Criar cliente
- [ ] Criar orçamento → Aprovar → Criar ordem
- [ ] Registrar pagamento
- [ ] Upload de anexo

**Ferramentas:**
- Playwright ou Cypress
- Jest para backend

---

### #31: Configurar CI/CD com GitHub Actions
**Prioridade:** Baixa
**Estimativa:** 2-3 horas

**Descrição:**
Pipeline de CI/CD automatizado.

**Pipelines:**
- [ ] Build e testes (backend)
- [ ] Build (frontend)
- [ ] Deploy automático (Railway + Vercel)
- [ ] Linting e formatação

**Implementação:**
- [ ] .github/workflows/backend.yml
- [ ] .github/workflows/frontend.yml
- [ ] .github/workflows/deploy.yml

---

### #32: Otimização de Performance
**Prioridade:** Baixa
**Estimativa:** 2-3 horas

**Descrição:**
Melhorias de performance e escalabilidade.

**Otimizações:**
- [ ] Adicionar índices no banco
- [ ] Implementar cache Redis (opcional)
- [ ] Lazy loading no frontend
- [ ] Paginação em todas listagens
- [ ] Otimizar queries Prisma (select específico)
- [ ] Compression no backend

---

### #34: Documentação e Onboarding
**Prioridade:** Baixa
**Estimativa:** 2-3 horas

**Descrição:**
Documentação completa do projeto.

**Documentos:**
- [ ] README.md completo
- [ ] SETUP.md (instruções de instalação)
- [ ] DEPLOY.md (guia de deploy)
- [ ] API.md (documentação da API)
- [ ] CONTRIBUTING.md (guia de contribuição)
- [ ] Swagger completo (já existe)

---

## 📊 Ordem de Execução Sugerida

1. **#23 - Portal do Cliente** (próxima)
2. **#24 - Notificações por Email**
3. **#25 - RBAC**
4. **#28 - Audit Log**
5. **#32 - Otimização de Performance**
6. **#34 - Documentação**
7. **#31 - CI/CD**
8. **#30 - Testes E2E**

---

## ✅ Critérios de Conclusão do MVP

- [x] CRUD completo de todas entidades
- [x] Multi-tenant funcional
- [x] Autenticação JWT
- [x] Dashboard com métricas
- [x] Geração de PDF
- [x] Upload de anexos (S3)
- [x] Sistema de agendamento
- [ ] Portal do cliente
- [ ] Notificações por email
- [ ] RBAC
- [ ] Audit log
- [ ] Deploy em produção
- [ ] Documentação completa

---

## 🎯 Meta

**MVP 100% completo em 8 tasks restantes!**

Após conclusão:
- Deploy em produção
- Onboarding de cliente piloto
- Coleta de feedback
- Iteração baseada em uso real
