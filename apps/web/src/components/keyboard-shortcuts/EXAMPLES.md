# Exemplos de Uso - Keyboard Shortcuts

Exemplos práticos de implementação de atalhos de teclado em diferentes cenários.

## Exemplo 1: Lista Simples (Customers)

Página de listagem com ações básicas: criar, buscar, filtrar.

```tsx
'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function CustomersPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Registra atalhos automaticamente
  useAutoRegisterShortcuts([
    {
      key: 'n',
      callback: () => router.push('/dashboard/customers/new'),
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
        description: 'Abrir filtros avançados',
        category: 'Navegação',
        ctrl: true,
      },
    },
  ], [router]);

  return (
    <div>
      <Input ref={searchInputRef} placeholder="Buscar..." />
      {/* resto do componente */}
    </div>
  );
}
```

## Exemplo 2: Formulário de Criação/Edição

Formulário com atalhos para salvar e cancelar.

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function CustomerFormPage() {
  const router = useRouter();
  const { registerShortcut } = useKeyboardShortcuts();
  const { handleSubmit } = useForm();

  useEffect(() => {
    // Ctrl+S para salvar
    const unregisterSave = registerShortcut('s', () => {
      handleSubmit(onSubmit)();
    }, {
      description: 'Salvar formulário',
      category: 'Ações',
      ctrl: true,
    });

    // Esc para cancelar
    const unregisterCancel = registerShortcut('escape', () => {
      router.back();
    }, {
      description: 'Cancelar e voltar',
      category: 'Navegação',
    });

    return () => {
      unregisterSave();
      unregisterCancel();
    };
  }, [registerShortcut, handleSubmit, router]);

  const onSubmit = async (data) => {
    // lógica de salvamento
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

## Exemplo 3: Página de Detalhes com Ações

Página de visualização com ações de editar e excluir.

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useAutoRegisterShortcuts([
    {
      key: 'e',
      callback: () => router.push(`/dashboard/customers/${params.id}/edit`),
      options: {
        description: 'Editar cliente',
        category: 'Ações',
      },
    },
    {
      key: 'delete',
      callback: () => setShowDeleteDialog(true),
      options: {
        description: 'Excluir cliente',
        category: 'Ações',
      },
    },
    {
      key: 'escape',
      callback: () => router.push('/dashboard/customers'),
      options: {
        description: 'Voltar para lista',
        category: 'Navegação',
      },
    },
  ], [router, params.id]);

  return <div>...</div>;
}
```

## Exemplo 4: Atalhos Condicionais

Atalhos que só funcionam em determinadas condições.

```tsx
'use client';

import { useEffect } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const { registerShortcut } = useKeyboardShortcuts();

  // Atalho só funciona se houver pedido selecionado
  useEffect(() => {
    if (!selectedOrder) return;

    const unregister = registerShortcut('e', () => {
      router.push(`/orders/${selectedOrder.id}/edit`);
    }, {
      description: 'Editar pedido selecionado',
      category: 'Ações',
    });

    return unregister;
  }, [selectedOrder]);

  // Atalho só funciona se usuário tiver permissão
  useEffect(() => {
    if (!canEdit) return;

    const unregister = registerShortcut('d', () => {
      handleDelete();
    }, {
      description: 'Excluir pedido',
      category: 'Ações',
      shift: true, // Shift+D para segurança
    });

    return unregister;
  }, [canEdit]);

  return <div>...</div>;
}
```

## Exemplo 5: Atalhos com Validação

Atalhos que validam antes de executar a ação.

```tsx
'use client';

import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';
import { showToast } from '@/lib/toast';

export default function QuotationsPage() {
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  useAutoRegisterShortcuts([
    {
      key: 'e',
      callback: () => {
        if (!selectedQuotation) {
          showToast.warning('Selecione um orçamento primeiro');
          return;
        }

        if (selectedQuotation.status === 'approved') {
          showToast.error('Não é possível editar orçamento aprovado');
          return;
        }

        router.push(`/quotations/${selectedQuotation.id}/edit`);
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
  ], [selectedQuotation]);

  return <div>...</div>;
}
```

## Exemplo 6: Helper Hook para Navegação

Uso do helper `useNavigationShortcuts` para atalhos comuns.

```tsx
'use client';

import { useState } from 'react';
import { useNavigationShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function ServicesPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Helper que registra atalhos comuns automaticamente
  useNavigationShortcuts({
    onNew: () => router.push('/dashboard/services/new'),
    onEdit: selectedService
      ? () => router.push(`/dashboard/services/${selectedService.id}/edit`)
      : undefined,
    onDelete: selectedService
      ? () => handleDelete(selectedService.id)
      : undefined,
    onSearch: () => searchInputRef.current?.focus(),
    category: 'Serviços',
  });

  return <div>...</div>;
}
```

## Exemplo 7: Múltiplos Atalhos para Mesma Ação

Fornecer múltiplas formas de executar a mesma ação.

```tsx
'use client';

import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function OrderFormPage() {
  const { handleSubmit } = useForm();

  const handleSave = () => {
    handleSubmit(onSubmit)();
  };

  useAutoRegisterShortcuts([
    // Ctrl+S (padrão universal)
    {
      key: 's',
      callback: handleSave,
      options: {
        description: 'Salvar',
        ctrl: true,
        category: 'Ações',
      },
    },
    // Ctrl+Enter (comum em formulários)
    {
      key: 'enter',
      callback: handleSave,
      options: {
        description: 'Salvar',
        ctrl: true,
        category: 'Ações',
      },
    },
  ], [handleSubmit]);

  return <form>...</form>;
}
```

## Exemplo 8: Atalhos de Navegação em Tabs

Navegar entre abas usando números.

```tsx
'use client';

import { useState } from 'react';
import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function CustomerDetailPage() {
  const [activeTab, setActiveTab] = useState('info');

  useAutoRegisterShortcuts([
    {
      key: '1',
      callback: () => setActiveTab('info'),
      options: {
        description: 'Aba Informações',
        category: 'Navegação',
        alt: true, // Alt+1
      },
    },
    {
      key: '2',
      callback: () => setActiveTab('contacts'),
      options: {
        description: 'Aba Contatos',
        category: 'Navegação',
        alt: true, // Alt+2
      },
    },
    {
      key: '3',
      callback: () => setActiveTab('addresses'),
      options: {
        description: 'Aba Endereços',
        category: 'Navegação',
        alt: true, // Alt+3
      },
    },
  ], []);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="info">Informações</TabsTrigger>
        <TabsTrigger value="contacts">Contatos</TabsTrigger>
        <TabsTrigger value="addresses">Endereços</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
```

## Exemplo 9: Atalhos Globais de Layout

Atalhos que funcionam em todo o dashboard.

```tsx
// app/dashboard/layout.tsx
'use client';

import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const router = useRouter();

  useAutoRegisterShortcuts([
    {
      key: 'h',
      callback: () => router.push('/dashboard'),
      options: {
        description: 'Ir para Home',
        category: 'Navegação',
        alt: true,
      },
    },
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
  ], [router]);

  return <div>{children}</div>;
}
```

## Exemplo 10: Atalhos em Modal/Dialog

Atalhos que funcionam apenas quando modal está aberto.

```tsx
'use client';

import { useEffect } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Dialog } from '@/components/ui/dialog';

export default function CustomerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { registerShortcut } = useKeyboardShortcuts();

  // Atalhos só funcionam quando modal está aberto
  useEffect(() => {
    if (!isModalOpen) return;

    const unregisterConfirm = registerShortcut('enter', () => {
      handleConfirm();
      setIsModalOpen(false);
    }, {
      description: 'Confirmar ação',
      category: 'Modal',
      ctrl: true,
    });

    const unregisterCancel = registerShortcut('escape', () => {
      setIsModalOpen(false);
    }, {
      description: 'Fechar modal',
      category: 'Modal',
    });

    return () => {
      unregisterConfirm();
      unregisterCancel();
    };
  }, [isModalOpen, registerShortcut]);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      {/* conteúdo do modal */}
    </Dialog>
  );
}
```

## Boas Práticas

### ✅ Faça

- Use categorias consistentes
- Forneça descrições claras
- Cleanup atalhos ao desmontar
- Valide antes de executar
- Use modificadores para ações destrutivas

### ❌ Evite

- Atalhos que conflitam com navegador
- Muitos atalhos sem organização
- Atalhos sem descrição
- Esquecer cleanup
- Atalhos em campos de input

## Checklist de Implementação

- [ ] Importar hook correto
- [ ] Definir callbacks
- [ ] Configurar options (description, category)
- [ ] Adicionar deps do useEffect se necessário
- [ ] Testar atalhos funcionam
- [ ] Verificar no help dialog (?)
- [ ] Testar cleanup ao desmontar
- [ ] Documentar no código

## Próximos Passos

Após implementar atalhos básicos, considere adicionar:

1. **Navegação em listas** (j/k para cima/baixo)
2. **Seleção múltipla** (Shift+Click, Ctrl+A)
3. **Undo/Redo** (Ctrl+Z, Ctrl+Y)
4. **Copiar/Colar** (Ctrl+C, Ctrl+V)
5. **Busca avançada** (Ctrl+F com modal)

Consulte a documentação completa em `keyboard-shortcuts/README.md`.
