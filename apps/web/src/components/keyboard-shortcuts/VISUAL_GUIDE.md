# Keyboard Shortcuts - Guia Visual

Guia visual interativo mostrando como o sistema de atalhos funciona.

## Fluxo de Uso do Usuário

```
┌─────────────────────────────────────────────────────────────┐
│                    1. Usuário Pressiona ?                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                2. Dialog de Ajuda se Abre                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Atalhos de Teclado                             [X]   │ │
│  │                                                       │ │
│  │  NAVEGAÇÃO                                            │ │
│  │  ┌─────────────────────────────────┬───────────────┐ │ │
│  │  │ Criar novo cliente              │  [N]          │ │ │
│  │  │ Focar na busca                  │  [/]          │ │ │
│  │  │ Abrir filtros avançados         │  [Ctrl] + [F] │ │ │
│  │  └─────────────────────────────────┴───────────────┘ │ │
│  │                                                       │ │
│  │  AÇÕES                                                │ │
│  │  ┌─────────────────────────────────┬───────────────┐ │ │
│  │  │ Salvar cliente                  │  [Ctrl] + [S] │ │ │
│  │  │ Cancelar e voltar               │  [Esc]        │ │ │
│  │  └─────────────────────────────────┴───────────────┘ │ │
│  │                                                       │ │
│  │  SISTEMA                                              │ │
│  │  ┌─────────────────────────────────┬───────────────┐ │ │
│  │  │ Mostrar esta ajuda              │  [?]          │ │ │
│  │  │ Fechar modais                   │  [Esc]        │ │ │
│  │  └─────────────────────────────────┴───────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              3. Usuário Vê Todos os Atalhos                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            4. Usuário Fecha Dialog (Esc ou X)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│             5. Usuário Usa Atalho Aprendido                 │
│                   (ex: pressiona 'n')                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              6. Ação é Executada Imediatamente              │
│          (ex: navega para /dashboard/customers/new)         │
└─────────────────────────────────────────────────────────────┘
```

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         Root Layout                         │
│                     (apps/web/app/layout.tsx)               │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │     KeyboardShortcutsProvider                         │ │
│  │     (Gerencia estado global)                          │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  Event Listener Global (window.keydown)         │ │ │
│  │  │                                                  │ │ │
│  │  │  ┌────────────────────────────────────────────┐ │ │ │
│  │  │  │  1. Detecta tecla pressionada              │ │ │ │
│  │  │  │  2. Verifica se não está em input          │ │ │ │
│  │  │  │  3. Busca atalho correspondente            │ │ │ │
│  │  │  │  4. Executa callback                       │ │ │ │
│  │  │  └────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  State: shortcuts[]                             │ │ │
│  │  │  State: isHelpOpen                              │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │     KeyboardShortcutsDialog                           │ │
│  │     (Exibe atalhos quando isHelpOpen = true)          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  {children}                                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Fluxo de Registro de Atalho

```
┌─────────────────────────────────────────────────────────────┐
│                   Componente da Página                      │
│                 (ex: CustomersPage)                         │
│                                                             │
│  useAutoRegisterShortcuts([                                 │
│    {                                                        │
│      key: 'n',                                              │
│      callback: () => router.push('/new'),                  │
│      options: {                                             │
│        description: 'Criar novo',                          │
│        category: 'Ações'                                    │
│      }                                                      │
│    }                                                        │
│  ]);                                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               useKeyboardShortcuts Hook                     │
│                                                             │
│  const { registerShortcut } = useKeyboardShortcutsContext() │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           KeyboardShortcutsProvider Context                 │
│                                                             │
│  registerShortcut(key, callback, options)                   │
│    │                                                        │
│    ├─> Gera ID único                                        │
│    ├─> Cria objeto KeyboardShortcut                        │
│    ├─> Verifica conflitos                                   │
│    ├─> Adiciona ao state: shortcuts[]                      │
│    └─> Retorna função cleanup                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Atalho Registrado!                          │
│              Aparece no Help Dialog                         │
│             Responde a eventos de teclado                   │
└─────────────────────────────────────────────────────────────┘
```

## Fluxo de Execução de Atalho

```
┌─────────────────────────────────────────────────────────────┐
│                Usuário Pressiona Tecla                      │
│                     (ex: 'n')                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Event Listener Captura                       │
│                 window.addEventListener('keydown')          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Verifica Contexto                          │
│                                                             │
│  if (isInputElement(event.target)) {                        │
│    return; // Não executa                                   │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Não está em input)
┌─────────────────────────────────────────────────────────────┐
│              Extrai Informações da Tecla                    │
│                                                             │
│  const key = event.key.toLowerCase();  // 'n'               │
│  const ctrl = event.ctrlKey;           // false             │
│  const alt = event.altKey;             // false             │
│  const shift = event.shiftKey;         // false             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Busca Atalho Correspondente                    │
│                                                             │
│  const matchingShortcut = shortcuts.find(s =>               │
│    s.key === key &&                                         │
│    !!s.ctrl === ctrl &&                                     │
│    !!s.alt === alt &&                                       │
│    !!s.shift === shift                                      │
│  );                                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Encontrou!)
┌─────────────────────────────────────────────────────────────┐
│              Previne Comportamento Padrão                   │
│                                                             │
│  if (matchingShortcut.preventDefault) {                     │
│    event.preventDefault();                                  │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Executa Callback                           │
│                                                             │
│  matchingShortcut.callback();                               │
│  // Ex: router.push('/dashboard/customers/new')             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Ação Executada!                          │
│              (Ex: Navega para nova página)                  │
└─────────────────────────────────────────────────────────────┘
```

## Detecção de Input

```
┌─────────────────────────────────────────────────────────────┐
│                 Usuário Pressiona Tecla                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              isInputElement(event.target)                   │
│                                                             │
│  Verifica se elemento ativo é:                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  <input>           → ❌ Bloqueia atalho              │   │
│  │  <textarea>        → ❌ Bloqueia atalho              │   │
│  │  <select>          → ❌ Bloqueia atalho              │   │
│  │  contenteditable   → ❌ Bloqueia atalho              │   │
│  │  <div> normal      → ✅ Permite atalho               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Resultado da Verificação                    │
│                                                             │
│  Em input?   → Retorna SEM executar atalho                  │
│  Fora input? → Continua e executa atalho                    │
└─────────────────────────────────────────────────────────────┘
```

## Cleanup de Atalhos

```
┌─────────────────────────────────────────────────────────────┐
│              Componente Monta (useEffect)                   │
│                                                             │
│  useEffect(() => {                                          │
│    const unregister = registerShortcut(...);                │
│                                                             │
│    return unregister; // ← Cleanup function                │
│  }, []);                                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                   Componente está ativo
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            Usuário Navega para Outra Página                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│             Componente Desmonta (useEffect)                 │
│                                                             │
│  React executa: unregister()                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           setShortcuts(prev =>                              │
│             prev.filter(s => s.id !== id)                   │
│           )                                                 │
│                                                             │
│  ✅ Atalho removido do state                                │
│  ✅ Memória liberada                                        │
│  ✅ Não aparece mais no Help                                │
│  ✅ Não responde mais a eventos                             │
└─────────────────────────────────────────────────────────────┘
```

## Categorização no Help Dialog

```
┌─────────────────────────────────────────────────────────────┐
│                   Help Dialog Aberto                        │
│                                                             │
│  shortcuts = [                                              │
│    { key: 'n', category: 'Ações', ... },                    │
│    { key: '/', category: 'Navegação', ... },                │
│    { key: 'e', category: 'Ações', ... },                    │
│    { key: 'Ctrl+F', category: 'Navegação', ... }            │
│  ]                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           groupShortcutsByCategory()                        │
│                                                             │
│  {                                                          │
│    'Navegação': [                                           │
│      { key: '/', ... },                                     │
│      { key: 'Ctrl+F', ... }                                 │
│    ],                                                       │
│    'Ações': [                                               │
│      { key: 'n', ... },                                     │
│      { key: 'e', ... }                                      │
│    ]                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              sortCategories()                               │
│                                                             │
│  Prioridade:                                                │
│  1. Navegação                                               │
│  2. Ações                                                   │
│  3. Edição                                                  │
│  4. Lista                                                   │
│  5. Geral                                                   │
│  6. Outros (alfabético)                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Renderiza Dialog Organizado                    │
│                                                             │
│  ┌────────────────────────────────────────────────┐         │
│  │  NAVEGAÇÃO                                     │         │
│  │  ├─ Focar na busca ...................... [/]  │         │
│  │  └─ Abrir filtros ......... [Ctrl] + [F]      │         │
│  │                                                │         │
│  │  AÇÕES                                         │         │
│  │  ├─ Criar novo ......................... [N]   │         │
│  │  └─ Editar ............................. [E]   │         │
│  └────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│           KeyboardShortcutsProvider State                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  shortcuts: KeyboardShortcut[]                       │  │
│  │                                                      │  │
│  │  [                                                   │  │
│  │    {                                                 │  │
│  │      id: 'shortcut-123456',                          │  │
│  │      key: 'n',                                       │  │
│  │      ctrl: false,                                    │  │
│  │      alt: false,                                     │  │
│  │      shift: false,                                   │  │
│  │      callback: () => router.push('/new'),           │  │
│  │      description: 'Criar novo cliente',             │  │
│  │      category: 'Ações',                             │  │
│  │      preventDefault: true                           │  │
│  │    },                                                │  │
│  │    { ... }                                           │  │
│  │  ]                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  isHelpOpen: boolean                                 │  │
│  │                                                      │  │
│  │  false → Dialog fechado                              │  │
│  │  true  → Dialog aberto                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Exemplo: Ciclo de Vida Completo

```
1. Usuário entra na página /dashboard/customers
   │
   ▼
2. CustomersPage monta e registra atalhos
   │
   ▼
3. Atalhos adicionados ao state global
   │
   ▼
4. Event listener detecta teclas
   │
   ▼
5. Usuário pressiona '?'
   │
   ▼
6. Dialog abre mostrando atalhos
   │
   ▼
7. Usuário fecha dialog
   │
   ▼
8. Usuário pressiona 'n'
   │
   ▼
9. Sistema verifica: não está em input ✓
   │
   ▼
10. Sistema busca atalho 'n' ✓
    │
    ▼
11. Executa: router.push('/dashboard/customers/new')
    │
    ▼
12. Navega para nova página
    │
    ▼
13. CustomersPage desmonta
    │
    ▼
14. Cleanup remove atalhos antigos
    │
    ▼
15. NewCustomerPage monta
    │
    ▼
16. Novos atalhos são registrados (Ctrl+S, Esc)
    │
    ▼
17. Ciclo continua...
```

---

Este guia visual ajuda a entender como o sistema funciona internamente e como os diferentes componentes interagem entre si.
