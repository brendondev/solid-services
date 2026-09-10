# Prompt: redesenho de UI/UX do Solid Service

> Copie tudo abaixo da linha e envie para o outro CLI.

---

Você vai redesenhar a interface do **Solid Service**, um ERP SaaS multi-tenant
para prestadores de serviço (MEIs, autônomos e pequenas empresas). O sistema
funciona bem, mas o visual é genérico — cara de template shadcn recém-instalado.
Sua tarefa é dar identidade e maturidade visual **sem quebrar nada**.

## Antes de tudo: leia o código, não presuma

Não comece a escrever CSS. Primeiro percorra o projeto e me diga o que
encontrou. As informações abaixo são um mapa inicial, não um substituto para
sua própria leitura.

## O projeto

Monorepo npm workspaces. O front é `apps/web`:

- **Next.js 15** (App Router) + **React 19** + TypeScript
- **Tailwind CSS 3.4** com a convenção shadcn de CSS variables em HSL
  (`apps/web/src/app/globals.css` + `apps/web/tailwind.config.ts`)
- **Radix UI** por baixo dos primitivos próprios em `apps/web/src/components/ui`
  (22 arquivos: button, card, dialog, select, table, toast, etc.)
- `next-themes` com `darkMode: 'class'` — **light e dark são obrigatórios**
- Recharts (gráficos), react-big-calendar (agenda), @dnd-kit (kanban),
  framer-motion, cmdk (command palette)
- Estado: React Query + Zustand · Formulários: React Hook Form + Zod

### As três áreas (todas no escopo)

| Área | Rotas | Quem usa |
| --- | --- | --- |
| **Dashboard** | 35 páginas em `/dashboard/*` | operador do negócio, o dia inteiro |
| **Portal do cliente** | 13 páginas em `/portal/*` | cliente final, acesso público por token, provavelmente no celular |
| **Auth** | 2 páginas em `/auth/*` | login e registro |

Navegação do dashboard hoje: Dashboard, Clientes, Ordens de Serviço,
Orçamentos, Agenda, Chat, Financeiro, Serviços, Fornecedores, Importar Dados,
Planos — mais Configurações (backup, empresa, integrações, notificações,
segurança), Usuários e Perfil.

O portal é uma superfície **pública e sem login**, acessada por link com token.
Ele carrega a impressão que o cliente final tem do negócio do usuário — trate
como vitrine, não como anexo do dashboard.

## Direção estética

**SaaS moderno, no espírito de Linear e Vercel.** Concretamente:

- Tipografia faz o trabalho pesado: hierarquia por peso e tamanho, não por
  caixinha colorida
- Paleta predominantemente neutra. **Cor é sinal**, não decoração — reserve
  para ação primária, estado e alerta
- Bordas sutis no lugar de sombras pesadas; profundidade por contraste de
  superfície, não por `box-shadow` difuso
- Denso, mas com respiro. Nada de card gigante com três palavras dentro
- Movimento discreto e funcional (o `framer-motion` já está lá) — nunca
  decorativo, nunca acima de ~200ms em transição de interface

O que evitar: gradiente sem propósito, glassmorphism, emoji como ícone de
interface, sombra colorida, "card de vidro", ilustração genérica de banco de
imagens.

## Restrição técnica principal

**Mantenha Tailwind + Radix + a convenção de CSS variables.** Não troque a
biblioteca de componentes. O ganho vem de redesenhar os *tokens*, o *layout* e
os *primitivos* — não de reescrever a stack.

Isso é deliberado: são 50 páginas construídas sobre esses primitivos. Refinar a
base propaga o novo visual para todas elas; trocar a stack gera regressão em
massa que ninguém vai conseguir revisar.

## Ordem de trabalho sugerida

1. **Tokens** (`globals.css`, `tailwind.config.ts`) — escala de cor para light
   e dark, escala tipográfica, espaçamento, raio, elevação. É aqui que a
   identidade nasce.
2. **Layout** (`apps/web/src/components/layout/`) — `sidebar.tsx` (181 linhas),
   `header.tsx` (310 linhas), `breadcrumbs.tsx`, `dashboard-layout.tsx`.
3. **Primitivos** (`apps/web/src/components/ui/`) — os 22 componentes base.
4. **Padrões recorrentes** — tabela/listagem, formulário, página de detalhe,
   estado vazio, estado de carregamento (`components/skeletons/`), estado de
   erro. Acertar cada padrão uma vez conserta dezenas de telas.
5. **Telas específicas** — só depois, e só onde o padrão não resolveu.

Faça em incrementos revisáveis, não num commit gigante.

## Problemas reais já identificados (aproveite para resolver)

Estes são fatos verificados no código, não suposições:

- **Documentação de design em conflito com o código.**
  `docs/development/DESIGN_SYSTEM.md` especifica uma paleta em hex
  (`--primary: #4A90E2`) que **não existe** no `globals.css`, onde o primary é
  o azul padrão do shadcn (`221.2 83.2% 53.3%`). Ao final, **atualize esse
  documento** para refletir o que você realmente implementou. Documentação que
  mente é pior que documentação ausente.
- **Três implementações de select convivendo:** `select.tsx`,
  `select-legacy.tsx`, `select-radix.tsx`. Consolide em uma.
- **Dois componentes de modal:** `modal.tsx` e `dialog.tsx`. Consolide.
- **Duas bibliotecas de toast em uso simultâneo:** `react-hot-toast` em 14
  arquivos e `sonner` em 4. Escolha uma, migre a outra. Toast é justamente onde
  inconsistência visual salta aos olhos.
- **Layout morto:** `apps/web/src/app/dashboard/layout.old.tsx`. Remova.
- **Dependência morta:** `@hello-pangea/dnd` está no `package.json` e é usada em
  **zero** arquivos (o kanban usa `@dnd-kit`). Remova do `package.json`.

## Regras invioláveis

1. **Não altere contratos de API nem lógica de negócio.** Este é um trabalho de
   interface. Se um ajuste visual parecer exigir mudança em endpoint, tipo de
   dado ou regra, **pare e pergunte**.
2. **Preserve as funcionalidades existentes:** command palette (`cmdk`),
   atalhos de teclado (`components/keyboard-shortcuts/`), PWA
   (`components/pwa/`), tema claro/escuro, assinatura digital, kanban, agenda.
3. **Dark mode não é opcional.** Toda mudança precisa funcionar nos dois temas.
   Verifique os dois — não presuma que "deve estar ok".
4. **Acessibilidade não regride.** Radix entrega semântica e foco de graça;
   não substitua primitivo acessível por `div` estilizada. Contraste mínimo
   AA. Foco visível em tudo que recebe teclado.
5. **Responsivo de verdade**, sobretudo no portal do cliente — o cliente final
   abre no celular.
6. **`npm run build:web` precisa passar** ao final. É o mínimo.

## Como rodar e verificar

O ambiente local já está montado e funcionando.

```bash
npm install
cp .env.example .env

# Banco: Docker OU Postgres portátil (qualquer um serve)
docker compose up -d postgres redis     # opção A
npm run pg:setup                        # opção B — não instala nada no sistema

npm run db:setup     # migrations + seed com dados de demonstração
npm run dev:api      # terminal 1 — porta 3000
npm run dev:web      # terminal 2 — porta 3001
```

**Login:** http://localhost:3001/auth/login → `admin@demo.com` / `123456`

Duas pegadinhas de rota que confundem quem chega agora:

- A tela de login é **`/auth/login`**, não `/login`
- **Não existe rota `/dashboard`** — o login redireciona para
  **`/dashboard/main`**. Um 404 em `/dashboard` é esperado, não é bug seu.

O seed cria dados suficientes para avaliar as telas cheias: 2 clientes,
4 serviços, 1 orçamento, 1 ordem de serviço e 1 recebível. É pouco para julgar
densidade — **crie mais registros** antes de decidir o design de tabela e
listagem. Uma tabela com 2 linhas engana.

Contexto adicional do projeto: `LOCAL.md` e
`docs/MIGRACAO-LOCAL-2026-09-09.md`.

## O que eu espero de você

Comece **mostrando sua leitura antes de executar**: o que achou do estado
atual, qual problema de UX considera mais grave, e qual sua proposta de direção
para os tokens. Quero concordar com o rumo antes de você tocar em 50 páginas.

Depois de aprovado, trabalhe em etapas, e ao fim de cada uma me diga o que
mudou e o que ainda está inconsistente. Se algo ficou pela metade, diga —
prefiro saber do que descobrir depois.
