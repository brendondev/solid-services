# Sistema de Keyboard Shortcuts

Sistema completo de atalhos de teclado para o Solid Service ERP, permitindo navegação rápida e eficiente através do sistema.

## Características

- **Global**: Funciona em toda a aplicação
- **Context-based**: Diferentes páginas podem ter diferentes atalhos
- **Help Dialog**: Pressione `?` para ver todos os atalhos disponíveis
- **Categorização**: Atalhos organizados por categoria
- **Type-safe**: TypeScript completo
- **Performance**: Otimizado com cleanup automático
- **Acessível**: Não interfere quando usuário está digitando em inputs

## Instalação

O sistema já está integrado no layout principal da aplicação. Não é necessária nenhuma configuração adicional.

## Uso Básico

### 1. Usando o Hook `useKeyboardShortcuts`

```tsx
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function MyComponent() {
  const router = useRouter();
  const { registerShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    // Registra um atalho simples
    const unregister = registerShortcut('n', () => {
      router.push('/customers/new');
    }, {
      description: 'Criar novo cliente',
      category: 'Ações',
      preventDefault: true,
    });

    // Cleanup automático
    return unregister;
  }, [router]);

  return <div>...</div>;
}
```

### 2. Usando o Hook `useAutoRegisterShortcuts`

Forma mais conveniente para registrar múltiplos atalhos:

```tsx
import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';

function CustomersPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useAutoRegisterShortcuts([
    {
      key: 'n',
      callback: () => router.push('/customers/new'),
      options: {
        description: 'Criar novo cliente',
        category: 'Ações',
      },
    },
    {
      key: '/',
      callback: () => searchInputRef.current?.focus(),
      options: {
        description: 'Focar na busca',
        category: 'Navegação',
      },
    },
    {
      key: 'f',
      callback: () => setShowFilters(true),
      options: {
        description: 'Abrir filtros',
        category: 'Navegação',
        ctrl: true, // Requer Ctrl+F
      },
    },
  ], [router]);

  return <div>...</div>;
}
```

### 3. Usando o Hook `useNavigationShortcuts`

Helper para atalhos de navegação comuns:

```tsx
import { useNavigationShortcuts } from '@/hooks/useKeyboardShortcuts';

function CustomersPage() {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useNavigationShortcuts({
    onNew: () => router.push('/customers/new'),
    onEdit: () => {
      if (selectedCustomer) {
        router.push(`/customers/${selectedCustomer.id}/edit`);
      }
    },
    onDelete: () => {
      if (selectedCustomer) {
        handleDelete(selectedCustomer.id);
      }
    },
    onSearch: () => searchInputRef.current?.focus(),
    category: 'Clientes',
  });

  return <div>...</div>;
}
```

## Modificadores de Teclas

Você pode usar modificadores (Ctrl, Alt, Shift) com qualquer atalho:

```tsx
registerShortcut('s', handleSave, {
  description: 'Salvar',
  ctrl: true, // Ctrl+S (Cmd+S no Mac)
});

registerShortcut('k', openCommandPalette, {
  description: 'Command Palette',
  ctrl: true,
  shift: true, // Ctrl+Shift+K
});
```

## Atalhos Padrão do Sistema

### Navegação
- `?` - Mostrar ajuda de atalhos
- `Esc` - Fechar modais e diálogos

### Ações (variam por página)
- `n` - Criar novo item
- `e` - Editar item selecionado
- `Del` - Excluir item selecionado
- `/` - Focar na busca
- `Ctrl+F` - Abrir filtros avançados

## Categorias Sugeridas

Para manter consistência, use estas categorias ao criar atalhos:

- `Navegação` - Atalhos de navegação entre páginas e seções
- `Ações` - Atalhos para criar, editar, excluir
- `Edição` - Atalhos para edição de formulários
- `Lista` - Atalhos para navegação em listas (j/k)
- `Geral` - Atalhos gerais do sistema

## Comportamento Inteligente

O sistema automaticamente:

- **Ignora inputs**: Não dispara atalhos quando usuário está digitando em `input`, `textarea` ou elementos `contenteditable`
- **Previne conflitos**: Avisa quando há atalhos duplicados
- **Cleanup automático**: Remove atalhos quando componente desmonta
- **Detecta plataforma**: Mostra `Cmd` no Mac e `Ctrl` no Windows/Linux

## Dialog de Ajuda

Pressione `?` ou `Shift+/` em qualquer página para abrir o dialog de ajuda que mostra:

- Todos os atalhos registrados na página atual
- Agrupados por categoria
- Formato visual das teclas
- Descrição de cada atalho

## API Completa

### Hook: `useKeyboardShortcuts()`

Retorna:
- `registerShortcut(key, callback, options)` - Registra um atalho
- `registerMultiple(shortcuts)` - Registra múltiplos atalhos
- `openHelp()` - Abre o dialog de ajuda

### Hook: `useAutoRegisterShortcuts(shortcuts, deps)`

Registra atalhos automaticamente com cleanup.

### Hook: `useNavigationShortcuts(options)`

Helper para atalhos de navegação comuns.

### Interface: `ShortcutOptions`

```typescript
interface ShortcutOptions {
  description: string;        // Descrição do atalho
  category?: string;          // Categoria para agrupamento
  preventDefault?: boolean;   // Prevenir comportamento padrão (default: true)
  ctrl?: boolean;            // Requer Ctrl/Cmd
  alt?: boolean;             // Requer Alt/Option
  shift?: boolean;           // Requer Shift
}
```

## Exemplos Avançados

### Atalho com Validação

```tsx
useAutoRegisterShortcuts([
  {
    key: 'e',
    callback: () => {
      if (!selectedItem) {
        showToast.warning('Selecione um item primeiro');
        return;
      }
      router.push(`/edit/${selectedItem.id}`);
    },
    options: {
      description: 'Editar item selecionado',
      category: 'Ações',
    },
  },
]);
```

### Atalho Condicional

```tsx
useEffect(() => {
  if (!isEditMode) return;

  const unregister = registerShortcut('s', handleSave, {
    description: 'Salvar alterações',
    category: 'Edição',
    ctrl: true,
  });

  return unregister;
}, [isEditMode]);
```

### Múltiplos Atalhos para Mesma Ação

```tsx
const handleSave = () => { /* ... */ };

useAutoRegisterShortcuts([
  {
    key: 's',
    callback: handleSave,
    options: { description: 'Salvar', ctrl: true },
  },
  {
    key: 'enter',
    callback: handleSave,
    options: { description: 'Salvar', ctrl: true },
  },
]);
```

## Troubleshooting

### Atalho não funciona

1. Verifique se o Provider está instalado no layout root
2. Verifique se não está sendo bloqueado por um input
3. Verifique conflitos com atalhos do navegador
4. Pressione `?` para ver se o atalho está registrado

### Atalhos duplicados

O sistema avisa no console quando detecta atalhos duplicados. O último registrado prevalece.

### Performance

Os atalhos são otimizados e não afetam a performance. O cleanup é automático quando componentes desmontam.

## Contribuindo

Ao adicionar novos atalhos:

1. Use categorias consistentes
2. Forneça descrições claras
3. Documente no código
4. Teste com inputs focados
5. Considere conflitos com navegadores

## Licença

Parte do Solid Service ERP - Sistema de gestão para prestadores de serviços.
