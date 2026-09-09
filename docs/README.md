# Documentação do Solid Service

Bem-vindo à documentação do projeto Solid Service.

> **Onde o projeto está rodando:** apenas **local**. Saiu do Vercel (web) +
> Railway (API) em 09/09/2026. Destino futuro: VPS Contabo + Coolify.

## 📚 Documentos Essenciais

### Para Começar
- **[../LOCAL.md](../LOCAL.md)** ⭐ — setup local, **fonte de verdade** (Docker e Postgres portátil)
- **[Getting Started](GETTING_STARTED.md)** — comandos do dia a dia, problemas comuns, estrutura
- **[Docker](../docker/README.md)** — como as imagens são construídas e o que cada serviço faz

### Estado e Histórico
- **[Migração para local (09/09/2026)](MIGRACAO-LOCAL-2026-09-09.md)** ⭐ — o que mudou, por quê, bugs corrigidos e pendências
- **[Status do Projeto](PROJECT-STATUS.md)** — análise do estado das features
- **[Roadmap Futuro](PASSOS-FINAIS-NFE-ETC.md)** — próximas funcionalidades (NFe, WhatsApp, etc.)

### Deploy
- **[Guia de Deploy](DEPLOY-GUIDE.md)** — checklist para o Coolify (não iniciado)

### Funcionalidades
- **[Keyboard Shortcuts](KEYBOARD_SHORTCUTS.md)** — atalhos de teclado implementados
- **[Testes de Segurança](SECURITY-TESTS.md)** — instruções para validar segurança
- **[Importação de Dados](IMPORTACAO-DADOS.md)** — importação de clientes e serviços

## 📂 Estrutura da Documentação

```
docs/
├── README.md (este arquivo)
├── MIGRACAO-LOCAL-2026-09-09.md ⭐ Estado atual e decisões
├── GETTING_STARTED.md - Comandos e troubleshooting
├── DEPLOY-GUIDE.md - Checklist do Coolify
├── PROJECT-STATUS.md - Status das features
├── PASSOS-FINAIS-NFE-ETC.md - Roadmap futuro
├── KEYBOARD_SHORTCUTS.md - Atalhos
├── SECURITY-TESTS.md - Segurança
│
├── archive/ - Documentos históricos (inclui o guia antigo Vercel/Railway)
├── architecture/ - Diagramas de arquitetura
├── deployment/ - Deploy e infraestrutura
└── development/ - Guias de desenvolvimento
```

## 🚀 Quick Start

```bash
git clone https://github.com/brendondev/solid-services.git
cd solid-services
npm install
cp .env.example .env

# A) Docker (já instalado nesta máquina)
docker compose up -d --build

# B) Sem Docker
npm run pg:setup && npm run db:setup
npm run dev:api    # terminal 1
npm run dev:web    # terminal 2
```

Acesse **http://localhost:3001/auth/login** com `admin@demo.com` / `123456`.

Detalhes completos em [../LOCAL.md](../LOCAL.md).

## 📊 Status Atual

- **Backend**: 90% ✅ (19 módulos funcionais)
- **Frontend**: 70% ✅ (26 páginas)
- **Banco de Dados**: 100% ✅ (21 tabelas)
- **Testes**: 10% ⚠️ (CRÍTICO - apenas 2 testes)

Ver análise completa em [PROJECT-STATUS.md](PROJECT-STATUS.md)

## 🎯 Próximos Passos

1. 🔴 **Rotacionar as chaves de S3** que vazaram no `.env.example` em repo público — ver [migração](MIGRACAO-LOCAL-2026-09-09.md#-rotacionar-as-credenciais-de-s3)
2. **Testes** (crítico) - Adicionar testes unitários e E2E
3. **Dashboard** - Completar gráficos e métricas
4. **Mobile Polish** - Melhorar responsividade
5. **Agenda** - Completar calendário e drag & drop

## 📞 Suporte

Para dúvidas técnicas, consulte a documentação específica em cada seção.
