# Keyboard Shortcuts - Implementações Sugeridas

Guia rápido para adicionar atalhos de teclado nas páginas restantes do sistema.

## Páginas Pendentes

### 1. Services (`/dashboard/services`)

```tsx
// apps/web/src/app/dashboard/services/page.tsx

import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function ServicesPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showFilters, setShowFilters] = useState(false);

  useAutoRegisterShortcuts([
    {
      key: 'n',
      callback: () => router.push('/dashboard/services/new'),
      options: {
        description: 'Criar novo serviço',
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
        description: 'Abrir filtros avançados',
        category: 'Navegação',
        ctrl: true,
      },
    },
  ], [router]);

  return (
    <div>
      <Input ref={searchInputRef} placeholder="Buscar serviços..." />
      {/* resto do componente */}
    </div>
  );
}
```

### 2. Service Form (`/dashboard/services/new` e `/edit`)

```tsx
// apps/web/src/app/dashboard/services/new/page.tsx

import { useEffect } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function ServiceFormPage() {
  const router = useRouter();
  const { registerShortcut } = useKeyboardShortcuts();
  const { handleSubmit } = useForm();

  useEffect(() => {
    const unregisterSave = registerShortcut('s', () => {
      handleSubmit(onSubmit)();
    }, {
      description: 'Salvar serviço',
      category: 'Ações',
      ctrl: true,
    });

    const unregisterCancel = registerShortcut('escape', () => {
      router.push('/dashboard/services');
    }, {
      description: 'Cancelar e voltar',
      category: 'Navegação',
    });

    return () => {
      unregisterSave();
      unregisterCancel();
    };
  }, [registerShortcut, handleSubmit, router]);

  return <form>...</form>;
}
```

### 3. Orders (`/dashboard/orders`)

```tsx
// apps/web/src/app/dashboard/orders/page.tsx

import { useNavigationShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function OrdersPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useNavigationShortcuts({
    onNew: () => router.push('/dashboard/orders/new'),
    onEdit: selectedOrder
      ? () => router.push(`/dashboard/orders/${selectedOrder.id}/edit`)
      : undefined,
    onSearch: () => searchInputRef.current?.focus(),
    category: 'Pedidos',
  });

  // Atalhos adicionais específicos de pedidos
  useAutoRegisterShortcuts([
    {
      key: 'c',
      callback: () => {
        if (selectedOrder?.status === 'open') {
          handleComplete(selectedOrder.id);
        }
      },
      options: {
        description: 'Marcar pedido como completo',
        category: 'Ações',
      },
    },
    {
      key: 'a',
      callback: () => {
        if (selectedOrder?.status === 'open') {
          handleSchedule(selectedOrder.id);
        }
      },
      options: {
        description: 'Agendar pedido',
        category: 'Ações',
      },
    },
  ], [selectedOrder]);

  return <div>...</div>;
}
```

### 4. Order Detail (`/dashboard/orders/[id]`)

```tsx
// apps/web/src/app/dashboard/orders/[id]/page.tsx

import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('info');

  useAutoRegisterShortcuts([
    // Ações
    {
      key: 'e',
      callback: () => router.push(`/dashboard/orders/${params.id}/edit`),
      options: {
        description: 'Editar pedido',
        category: 'Ações',
      },
    },
    {
      key: 'p',
      callback: () => handlePrint(),
      options: {
        description: 'Imprimir pedido',
        category: 'Ações',
        ctrl: true,
      },
    },
    // Navegação em tabs
    {
      key: '1',
      callback: () => setActiveTab('info'),
      options: {
        description: 'Aba Informações',
        category: 'Navegação',
        alt: true,
      },
    },
    {
      key: '2',
      callback: () => setActiveTab('items'),
      options: {
        description: 'Aba Itens',
        category: 'Navegação',
        alt: true,
      },
    },
    {
      key: '3',
      callback: () => setActiveTab('timeline'),
      options: {
        description: 'Aba Histórico',
        category: 'Navegação',
        alt: true,
      },
    },
  ], [router, params.id]);

  return <div>...</div>;
}
```

### 5. Quotations (`/dashboard/quotations`)

```tsx
// apps/web/src/app/dashboard/quotations/page.tsx

import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';
import { showToast } from '@/lib/toast';

export default function QuotationsPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  useAutoRegisterShortcuts([
    {
      key: 'n',
      callback: () => router.push('/dashboard/quotations/new'),
      options: {
        description: 'Criar novo orçamento',
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
      key: 'e',
      callback: () => {
        if (!selectedQuotation) {
          showToast.warning('Selecione um orçamento primeiro');
          return;
        }
        router.push(`/dashboard/quotations/${selectedQuotation.id}/edit`);
      },
      options: {
        description: 'Editar orçamento selecionado',
        category: 'Ações',
      },
    },
    {
      key: 'd',
      callback: () => {
        if (!selectedQuotation) {
          showToast.warning('Selecione um orçamento primeiro');
          return;
        }
        handleDuplicate(selectedQuotation.id);
      },
      options: {
        description: 'Duplicar orçamento',
        category: 'Ações',
      },
    },
    {
      key: 's',
      callback: () => {
        if (!selectedQuotation || selectedQuotation.status !== 'draft') {
          showToast.warning('Selecione um orçamento em rascunho');
          return;
        }
        handleSend(selectedQuotation.id);
      },
      options: {
        description: 'Enviar orçamento',
        category: 'Ações',
        ctrl: true,
        shift: true,
      },
    },
  ], [router, selectedQuotation]);

  return <div>...</div>;
}
```

### 6. Financial - Receivables (`/dashboard/financial/receivables`)

```tsx
// apps/web/src/app/dashboard/financial/receivables/page.tsx

import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function ReceivablesPage() {
  const router = useRouter();
  const [selectedReceivable, setSelectedReceivable] = useState(null);

  useAutoRegisterShortcuts([
    {
      key: 'n',
      callback: () => router.push('/dashboard/financial/receivables/new'),
      options: {
        description: 'Novo recebível',
        category: 'Ações',
      },
    },
    {
      key: 'p',
      callback: () => {
        if (!selectedReceivable) return;
        handleMarkAsPaid(selectedReceivable.id);
      },
      options: {
        description: 'Marcar como pago',
        category: 'Ações',
      },
    },
    {
      key: 'f',
      callback: () => setShowFilters(true),
      options: {
        description: 'Filtros avançados',
        category: 'Navegação',
        ctrl: true,
      },
    },
  ], [router, selectedReceivable]);

  return <div>...</div>;
}
```

### 7. Financial - Payables (`/dashboard/financial/payables`)

```tsx
// apps/web/src/app/dashboard/financial/payables/page.tsx

import { useNavigationShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function PayablesPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedPayable, setSelectedPayable] = useState(null);

  useNavigationShortcuts({
    onNew: () => router.push('/dashboard/financial/payables/new'),
    onEdit: selectedPayable
      ? () => router.push(`/dashboard/financial/payables/${selectedPayable.id}/edit`)
      : undefined,
    onSearch: () => searchInputRef.current?.focus(),
    category: 'Contas a Pagar',
  });

  // Atalho adicional para marcar como pago
  useAutoRegisterShortcuts([
    {
      key: 'p',
      callback: () => {
        if (!selectedPayable) return;
        handleMarkAsPaid(selectedPayable.id);
      },
      options: {
        description: 'Marcar como pago',
        category: 'Ações',
      },
    },
  ], [selectedPayable]);

  return <div>...</div>;
}
```

### 8. Suppliers (`/dashboard/suppliers`)

```tsx
// apps/web/src/app/dashboard/suppliers/page.tsx

import { useNavigationShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function SuppliersPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useNavigationShortcuts({
    onNew: () => router.push('/dashboard/suppliers/new'),
    onEdit: selectedSupplier
      ? () => router.push(`/dashboard/suppliers/${selectedSupplier.id}/edit`)
      : undefined,
    onDelete: selectedSupplier
      ? () => handleDelete(selectedSupplier.id)
      : undefined,
    onSearch: () => searchInputRef.current?.focus(),
    category: 'Fornecedores',
  });

  return <div>...</div>;
}
```

### 9. Dashboard Home (`/dashboard`)

```tsx
// apps/web/src/app/dashboard/page.tsx

import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function DashboardPage() {
  const router = useRouter();

  useAutoRegisterShortcuts([
    {
      key: 'c',
      callback: () => router.push('/dashboard/customers'),
      options: {
        description: 'Ir para Clientes',
        category: 'Navegação',
        alt: true,
      },
    },
    {
      key: 'o',
      callback: () => router.push('/dashboard/orders'),
      options: {
        description: 'Ir para Pedidos',
        category: 'Navegação',
        alt: true,
      },
    },
    {
      key: 'q',
      callback: () => router.push('/dashboard/quotations'),
      options: {
        description: 'Ir para Orçamentos',
        category: 'Navegação',
        alt: true,
      },
    },
    {
      key: 'f',
      callback: () => router.push('/dashboard/financial/receivables'),
      options: {
        description: 'Ir para Financeiro',
        category: 'Navegação',
        alt: true,
      },
    },
    {
      key: 's',
      callback: () => router.push('/dashboard/services'),
      options: {
        description: 'Ir para Serviços',
        category: 'Navegação',
        alt: true,
      },
    },
  ], [router]);

  return <div>...</div>;
}
```

## Atalhos Sugeridos por Contexto

### Listas (Index Pages)

| Atalho | Ação |
|--------|------|
| `n` | Criar novo item |
| `/` | Focar busca |
| `Ctrl+F` | Filtros avançados |
| `e` | Editar selecionado |
| `Del` | Excluir selecionado |

### Formulários (Create/Edit)

| Atalho | Ação |
|--------|------|
| `Ctrl+S` | Salvar |
| `Ctrl+Enter` | Salvar e criar outro |
| `Esc` | Cancelar |

### Páginas de Detalhe

| Atalho | Ação |
|--------|------|
| `e` | Editar |
| `p` | Imprimir |
| `d` | Duplicar |
| `Esc` | Voltar |
| `Alt+1/2/3` | Navegar tabs |

### Ações Financeiras

| Atalho | Ação |
|--------|------|
| `p` | Marcar como pago |
| `r` | Registrar pagamento |
| `v` | Ver comprovante |

## Template Rápido

Use este template para adicionar atalhos em qualquer página:

```tsx
import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function MyPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useAutoRegisterShortcuts([
    {
      key: 'n',
      callback: () => router.push('/path/to/new'),
      options: {
        description: 'Criar novo',
        category: 'Ações',
      },
    },
    {
      key: '/',
      callback: () => searchInputRef.current?.focus(),
      options: {
        description: 'Focar busca',
        category: 'Navegação',
      },
    },
  ], [router]);

  return (
    <div>
      <Input ref={searchInputRef} placeholder="Buscar..." />
    </div>
  );
}
```

## Checklist de Implementação

Para cada página:

- [ ] Importar hook apropriado
- [ ] Adicionar ref no input de busca (se houver)
- [ ] Definir atalhos básicos (n, /, Ctrl+F)
- [ ] Adicionar atalhos específicos do contexto
- [ ] Testar atalhos funcionam
- [ ] Verificar aparecem no help (?)
- [ ] Documentar no código
- [ ] Atualizar KEYBOARD_SHORTCUTS.md

## Priorização

### Alta Prioridade
1. ✅ Customers (Implementado)
2. Orders
3. Quotations
4. Financial

### Média Prioridade
5. Services
6. Suppliers
7. Dashboard Home

### Baixa Prioridade
8. Settings
9. Reports
10. User Profile

## Notas Importantes

1. **Sempre use refs para inputs de busca**
   ```tsx
   const searchInputRef = useRef<HTMLInputElement>(null);
   <Input ref={searchInputRef} />
   ```

2. **Valide antes de executar ações**
   ```tsx
   if (!selectedItem) {
     showToast.warning('Selecione um item primeiro');
     return;
   }
   ```

3. **Use categorias consistentes**
   - Navegação
   - Ações
   - Edição
   - Lista

4. **Documente modificadores claramente**
   ```tsx
   ctrl: true,  // Ctrl+S (Cmd+S no Mac)
   ```

## Testes

Após implementar atalhos:

1. Testar atalho funciona
2. Testar não dispara em inputs
3. Verificar no help dialog (?)
4. Testar cleanup ao navegar
5. Testar conflitos com navegador

## Recursos

- Documentação: `/components/keyboard-shortcuts/README.md`
- Exemplos: `/components/keyboard-shortcuts/EXAMPLES.md`
- User Guide: `/docs/KEYBOARD_SHORTCUTS.md`

---

**Objetivo**: 100% das páginas com atalhos de teclado até Abril 2026
