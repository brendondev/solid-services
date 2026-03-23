# 🗺️ Roadmap de Desenvolvimento - Solid Service
**Última atualização**: 2026-03-23
**Status do Backend**: ✅ 100% Completo (96 endpoints)
**Foco Atual**: 🎨 Frontend MVP

---

## 📊 Status Geral

| Componente | Status | Progresso |
|------------|--------|-----------|
| Backend API | ✅ Completo | 100% |
| Frontend Web | 🔄 Em Progresso | 0% |
| Documentação | ✅ Completo | 100% |
| Deploy | ✅ Produção | Railway |

---

## ✅ Concluído (Backend)

### 2026-03-23 - Correções Críticas
- [x] **Fix: Tenant Context** - Migração para Request-scoped service
- [x] **Fix: JWT Strategy** - Arquitetura híbrida AsyncLocalStorage
- [x] **Deploy Railway** - Sistema 100% funcional em produção

### 2026-03-19 - Sistema Core
- [x] **Multi-tenant** - Row-level isolation com AsyncLocalStorage
- [x] **Auth & JWT** - Registro, login, refresh tokens
- [x] **Users Module** - CRUD + convites + roles
- [x] **Customers Module** - CRUD + contatos + endereços
- [x] **Services Module** - Catálogo de serviços
- [x] **Quotations Module** - Orçamentos + conversão para OS
- [x] **Service Orders Module** - OS completas + timeline + checklist + anexos
- [x] **Financial Module** - Recebíveis + Pagamentos + Pagáveis
- [x] **Dashboard Module** - Métricas operacionais
- [x] **Customer Portal** - Acompanhamento externo
- [x] **Subscriptions Module** - Planos + limites + feature gating
- [x] **Audit Module** - Rastreamento de alterações
- [x] **Scheduling Module** - Disponibilidade de técnicos
- [x] **Notifications** - Serviço base (email via Resend)
- [x] **Storage** - Upload S3 (Railway/T3)

---

## 🚀 Em Andamento

### Sprint 1: Setup & Autenticação (1-2 semanas)
**Início**: 2026-03-23
**Objetivo**: Base do frontend + autenticação funcional

#### Tarefas
- [ ] **1.1 Setup Next.js 14**
  - [ ] Criar projeto em `apps/web`
  - [ ] Configurar TypeScript
  - [ ] Setup TailwindCSS
  - [ ] Instalar shadcn/ui
  - [ ] Estrutura de pastas (app router)
  - [ ] Configurar variáveis de ambiente

- [ ] **1.2 Biblioteca de Componentes**
  - [ ] Instalar componentes shadcn/ui base:
    - [ ] Button, Input, Label
    - [ ] Card, Alert
    - [ ] Dialog, Sheet
    - [ ] Table, Pagination
    - [ ] Select, Checkbox, Radio
    - [ ] Toast/Sonner
    - [ ] Dropdown Menu
    - [ ] Avatar
  - [ ] Tema customizado (cores da marca)
  - [ ] Configurar fonte (Geist/Inter)

- [ ] **1.3 Sistema de Autenticação**
  - [ ] Criar API client (axios/fetch)
  - [ ] Context de autenticação
  - [ ] Hook useAuth
  - [ ] Página de Login (`/login`)
  - [ ] Página de Registro (`/register`)
  - [ ] Logout funcional
  - [ ] Protected routes (middleware)
  - [ ] Persistência de token (localStorage/cookies)
  - [ ] Refresh token automático

- [ ] **1.4 Layout Base**
  - [ ] Shell principal (`/dashboard/*`)
  - [ ] Sidebar responsiva
  - [ ] Header com user menu
  - [ ] Breadcrumbs
  - [ ] Mobile menu (hamburguer)
  - [ ] Footer (opcional)
  - [ ] Loading states
  - [ ] Error boundaries

---

## 📋 Próximas Sprints

### Sprint 2: Módulos Operacionais Core (1-2 semanas)
**Objetivo**: Clientes + Serviços funcionais

#### Tarefas
- [ ] **2.1 Módulo Clientes**
  - [ ] Listagem com tabela (`/dashboard/customers`)
  - [ ] Busca e filtros
  - [ ] Formulário de cadastro (Dialog)
  - [ ] Formulário de edição
  - [ ] Página de detalhes (`/dashboard/customers/[id]`)
  - [ ] Aba de contatos
  - [ ] Aba de endereços
  - [ ] Aba de histórico
  - [ ] Ações: ativar/desativar
  - [ ] Validação de formulários (zod)

- [ ] **2.2 Módulo Serviços**
  - [ ] Listagem com grid/tabela (`/dashboard/services`)
  - [ ] Filtros por categoria
  - [ ] Formulário de cadastro
  - [ ] Formulário de edição
  - [ ] Desativar serviço
  - [ ] Cards de serviços mais usados

---

### Sprint 3: Orçamentos + Ordens de Serviço (2 semanas)
**Objetivo**: Workflow completo de vendas e execução

#### Tarefas
- [ ] **3.1 Módulo Orçamentos**
  - [ ] Listagem (`/dashboard/quotations`)
  - [ ] Filtros por status
  - [ ] Formulário de criação
  - [ ] Seletor de cliente
  - [ ] Adicionar/remover itens de serviço
  - [ ] Cálculo automático de totais
  - [ ] Descontos
  - [ ] Observações
  - [ ] Visualizar PDF
  - [ ] Enviar para aprovação
  - [ ] Converter em OS
  - [ ] Página de detalhes (`/dashboard/quotations/[id]`)

- [ ] **3.2 Módulo Ordens de Serviço**
  - [ ] Listagem (`/dashboard/orders`)
  - [ ] Kanban board por status
  - [ ] Filtros avançados
  - [ ] Criar OS manual
  - [ ] Criar OS a partir de orçamento
  - [ ] Página de detalhes (`/dashboard/orders/[id]`)
  - [ ] Timeline de eventos
  - [ ] Checklist interativo
  - [ ] Upload de anexos (drag & drop)
  - [ ] Galeria de imagens
  - [ ] Mudar status
  - [ ] Atribuir técnico
  - [ ] Reagendar

- [ ] **3.3 Agenda Visual**
  - [ ] Calendário mensal (`/dashboard/schedule`)
  - [ ] Visualização semanal
  - [ ] Visualização diária
  - [ ] Filtro por técnico
  - [ ] Drag & drop para reagendar
  - [ ] Criar OS direto do calendário
  - [ ] Indicadores de disponibilidade

---

### Sprint 4: Financeiro + Dashboard (1 semana)
**Objetivo**: Gestão financeira básica + métricas

#### Tarefas
- [ ] **4.1 Módulo Financeiro**
  - [ ] Listagem de recebíveis (`/dashboard/financial/receivables`)
  - [ ] Filtros por status, vencimento
  - [ ] Registrar pagamento (Dialog)
  - [ ] Múltiplos pagamentos parciais
  - [ ] Baixa automática ao completar
  - [ ] Listagem de pagáveis (`/dashboard/financial/payables`)
  - [ ] Fornecedores básicos
  - [ ] Dashboard financeiro simples

- [ ] **4.2 Dashboard Operacional**
  - [ ] Cards de métricas principais (`/dashboard`)
  - [ ] Gráfico de receita mensal
  - [ ] Gráfico de OS por status
  - [ ] Top clientes
  - [ ] Top serviços
  - [ ] Indicadores em tempo real
  - [ ] Filtro de período

---

### Sprint 5: Portal do Cliente (1 semana)
**Objetivo**: Interface externa para clientes

#### Tarefas
- [ ] **5.1 Autenticação Externa**
  - [ ] Login por token magic link
  - [ ] Validação de acesso
  - [ ] Layout simplificado (sem sidebar)

- [ ] **5.2 Páginas do Portal**
  - [ ] Home do cliente (`/portal`)
  - [ ] Listar orçamentos
  - [ ] Visualizar orçamento
  - [ ] Aprovar orçamento (botão + confirmação)
  - [ ] Rejeitar orçamento (com motivo)
  - [ ] Listar ordens de serviço
  - [ ] Detalhes da OS
  - [ ] Histórico completo
  - [ ] Visualizar anexos
  - [ ] Download de PDF

---

## 📦 Backlog (Pós-MVP)

### Melhorias Futuras
- [ ] Sistema de notificações push
- [ ] Integração com WhatsApp
- [ ] Relatórios avançados (PDF/Excel)
- [ ] Configurações do tenant
- [ ] Temas customizáveis
- [ ] Multi-idioma (i18n)
- [ ] PWA (Progressive Web App)
- [ ] Mobile app (React Native)
- [ ] Integração com gateways de pagamento
- [ ] NFe/NFSe automático
- [ ] Assinatura eletrônica
- [ ] Gestão de estoque avançada
- [ ] CRM completo
- [ ] Contratos recorrentes
- [ ] Comissões e gamificação
- [ ] Analytics avançado
- [ ] Automações (n8n/Zapier)

---

## 🎯 Definição de Pronto (DoD)

Para marcar uma tarefa como concluída, ela deve:
- ✅ Código implementado e testado manualmente
- ✅ Responsivo (mobile, tablet, desktop)
- ✅ Loading states implementados
- ✅ Error handling implementado
- ✅ Validações de formulário (quando aplicável)
- ✅ Integrada com API backend
- ✅ Commits no git com mensagens descritivas
- ✅ Deploy em produção funcionando

---

## 📈 Métricas de Progresso

### Backend (Concluído)
- **Módulos**: 15/15 ✅
- **Endpoints**: 96/96 ✅
- **Testes**: Manual ✅
- **Deploy**: Railway ✅

### Frontend (Sprint 1 - 0%)
- **Setup**: 0/6 ⚠️
- **Componentes UI**: 0/12 ⚠️
- **Autenticação**: 0/9 ⚠️
- **Layout Base**: 0/8 ⚠️

---

## 🔗 Links Úteis

- **API Produção**: https://solid-services-production.up.railway.app
- **API Docs (Swagger)**: https://solid-services-production.up.railway.app/api
- **GitHub**: https://github.com/brendondev/solid-services
- **Railway**: https://railway.app

---

## 📝 Notas de Implementação

### Stack Frontend Definida
- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui + Radix UI
- **Styling**: TailwindCSS
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios
- **State**: React Context + Hooks
- **Icons**: Lucide React
- **Date**: date-fns
- **Toast**: Sonner

### Convenções
- **Rotas**: `/dashboard/*` para área autenticada
- **Rotas**: `/portal/*` para área do cliente
- **Componentes**: PascalCase
- **Hooks**: `use` prefix
- **API calls**: `services/` folder
- **Types**: `types/` folder compartilhados
