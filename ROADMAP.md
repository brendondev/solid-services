# 🗺️ Roadmap de Desenvolvimento - Solid Service
**Última atualização**: 2026-03-23
**Status do Backend**: ✅ 100% Completo (96 endpoints)
**Foco Atual**: 🎨 Frontend MVP

---

## 📊 Status Geral

| Componente | Status | Progresso |
|------------|--------|-----------|
| Backend API | ✅ Completo | 100% |
| Frontend Web | 🔄 Em Progresso | **70%** ⚡ |
| Mobile-First | ⚠️ Precisa Melhorias | 30% |
| Documentação | ✅ Completo | 100% |
| Deploy | ✅ Produção | Railway |

**🎉 DESCOBERTA**: Frontend muito mais avançado que esperado!
**📱 FOCO**: Melhorias mobile-first + completar funcionalidades

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

### Sprint 1: Mobile-First Fixes & Polish (1 semana) ⚡ REDEFINIDA
**Início**: 2026-03-23
**Objetivo**: Corrigir responsividade mobile + melhorar UX

**IMPORTANTE**: Setup base JÁ EXISTE (70% implementado)!
Agora vamos focar em **mobile-first** e **completar funcionalidades**.

#### Tarefas
- [x] **1.1 Setup Next.js 15** ✅ JÁ FEITO
  - [x] Projeto criado em `apps/web`
  - [x] TypeScript configurado
  - [x] TailwindCSS instalado
  - [x] shadcn/ui (Radix) instalado
  - [x] Estrutura de pastas criada
  - [x] Variáveis de ambiente

- [x] **1.2 Biblioteca de Componentes** ✅ ~60% FEITO
  - [x] Button, Input, Label
  - [x] Dialog, Sheet
  - [x] Select, Checkbox
  - [x] Dropdown Menu
  - [ ] Card (customizado)
  - [ ] Alert/AlertDialog
  - [ ] Table (data-table)
  - [ ] Pagination
  - [ ] Toast/Sonner (melhorar)
  - [ ] Avatar
  - [ ] Badge
  - [ ] Tabs, Accordion

- [x] **1.3 Sistema de Autenticação** ✅ ~90% FEITO
  - [x] API client (axios)
  - [x] Página de Login
  - [x] Página de Registro
  - [x] Logout funcional
  - [x] Protected routes (redirect)
  - [x] Persistência de token (localStorage)
  - [ ] **FALTA**: Refresh token automático
  - [ ] **FALTA**: Recuperação de senha

- [x] **1.4 Layout Base** ✅ ~95% FEITO
  - [x] Shell dashboard (`/dashboard/*`)
  - [x] Sidebar responsiva
  - [x] Header com user menu
  - [x] Mobile menu (hamburguer + overlay)
  - [x] Command Palette (Cmd+K)
  - [x] Keyboard shortcuts
  - [ ] **FALTA**: Breadcrumbs
  - [ ] **FALTA**: Error boundaries

- [x] **1.5 Melhorias Mobile-First** ✅ COMPLETO (2026-03-23)
  - [x] Fix sidebar mobile (iniciar fechada em <lg)
  - [x] Detectar tamanho da tela e ajustar automaticamente
  - [x] Auto-fechar sidebar ao navegar (mobile)
  - [x] Auto-abrir sidebar em resize para desktop
  - [x] Touch targets >= 44px (todos os botões)
  - [x] Transições suaves (ease-in-out)
  - [x] Overlay com backdrop-blur
  - [x] Active states para feedback tátil
  - [x] ARIA labels para acessibilidade
  - [x] Padding responsivo (p-4 sm:p-6)
  - [x] Command Palette e Tenant badge ocultos em mobile
  - [ ] Swipe gestures (próxima iteração)
  - [ ] Bottom navigation mobile (opcional)
  - [ ] Formulários single-column em mobile (próximo)
  - [ ] Modais full-screen em mobile (próximo)
  - [ ] Tabelas com scroll horizontal (próximo)

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

### Frontend (Sprint 1 - 85%)
- **Setup**: 6/6 ✅
- **Componentes UI**: 8/12 ⚠️
- **Autenticação**: 7/9 ⚠️
- **Layout Base**: 7/8 ⚠️
- **Mobile-First**: 11/16 ✅ (melhorias principais concluídas)

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
