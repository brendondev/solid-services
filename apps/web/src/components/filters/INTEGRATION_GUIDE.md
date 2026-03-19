# Guia de Integração - Sistema de Filtros Avançados

Este guia mostra como integrar o sistema de filtros em diferentes páginas do Solid Service ERP.

## Passo a Passo de Integração

### 1. Importar os componentes e hook

```tsx
import { useState } from 'react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { FilterChip, FilterDrawer, FilterSection } from '@/components/filters';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
```

### 2. Configurar o hook e estado

```tsx
export default function MyPage() {
  const { filters, setFilter, removeFilter, clearFilters, hasActiveFilters } = useUrlFilters();
  const [showFilters, setShowFilters] = useState(false);

  // ... resto do componente
}
```

### 3. Adicionar botão de filtros

```tsx
<Button
  variant="outline"
  onClick={() => setShowFilters(true)}
  className="gap-2"
>
  <Filter className="h-4 w-4" />
  Filtros Avançados
  {hasActiveFilters && (
    <span className="ml-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
      {Object.keys(filters).length}
    </span>
  )}
</Button>
```

### 4. Exibir chips de filtros ativos

```tsx
{hasActiveFilters && (
  <div className="flex flex-wrap items-center gap-2">
    <span className="text-sm text-muted-foreground">Filtros ativos:</span>

    {filters.status && (
      <FilterChip
        label="Status"
        value={filters.status}
        onRemove={() => removeFilter('status')}
      />
    )}

    {/* Adicione mais chips conforme necessário */}

    <Button
      variant="ghost"
      size="sm"
      onClick={clearFilters}
    >
      Limpar tudo
    </Button>
  </div>
)}
```

### 5. Criar o drawer de filtros

```tsx
<FilterDrawer
  isOpen={showFilters}
  onClose={() => setShowFilters(false)}
  onClear={clearFilters}
>
  <FilterSection title="Status">
    {/* Seus inputs de filtro aqui */}
  </FilterSection>

  <FilterSection title="Outro Filtro">
    {/* Mais inputs */}
  </FilterSection>
</FilterDrawer>
```

### 6. Aplicar filtros aos dados

```tsx
const filteredData = useMemo(() => {
  let result = data;

  if (filters.status) {
    result = result.filter(item => item.status === filters.status);
  }

  if (filters.type) {
    result = result.filter(item => item.type === filters.type);
  }

  return result;
}, [data, filters]);
```

## Exemplos por Módulo

### Clientes (Customers)

```tsx
// Filtros disponíveis
const customerFilters = {
  status: ['active', 'inactive'],
  type: ['company', 'individual'],
  search: 'string',
};

// No drawer
<FilterSection title="Status">
  <Checkbox
    checked={filters.status === 'active'}
    onCheckedChange={(checked) => {
      if (checked) setFilter('status', 'active');
      else removeFilter('status');
    }}
  >
    Ativo
  </Checkbox>
</FilterSection>
```

### Orçamentos (Quotations)

```tsx
// Filtros disponíveis
const quotationFilters = {
  status: ['draft', 'sent', 'approved', 'rejected'],
  dateFrom: 'date',
  dateTo: 'date',
  minValue: 'number',
  maxValue: 'number',
};

// No drawer
<FilterSection title="Status">
  <Select
    value={filters.status as string}
    onValueChange={(value) => setFilter('status', value)}
  >
    <SelectItem value="draft">Rascunho</SelectItem>
    <SelectItem value="sent">Enviado</SelectItem>
    <SelectItem value="approved">Aprovado</SelectItem>
    <SelectItem value="rejected">Rejeitado</SelectItem>
  </Select>
</FilterSection>

<FilterSection title="Valor">
  <Input
    type="number"
    placeholder="Valor mínimo"
    value={filters.minValue || ''}
    onChange={(e) => setFilter('minValue', e.target.value)}
  />
  <Input
    type="number"
    placeholder="Valor máximo"
    value={filters.maxValue || ''}
    onChange={(e) => setFilter('maxValue', e.target.value)}
  />
</FilterSection>
```

### Ordens de Serviço (Orders)

```tsx
// Filtros disponíveis
const orderFilters = {
  status: ['open', 'scheduled', 'in_progress', 'completed', 'cancelled'],
  priority: ['low', 'medium', 'high', 'urgent'],
  assignedTo: 'string',
  scheduledFrom: 'date',
  scheduledTo: 'date',
};

// No drawer
<FilterSection title="Prioridade">
  <div className="space-y-2">
    {['low', 'medium', 'high', 'urgent'].map(priority => (
      <Checkbox
        key={priority}
        checked={filters.priority === priority}
        onCheckedChange={(checked) => {
          if (checked) setFilter('priority', priority);
          else removeFilter('priority');
        }}
      >
        {priorityLabels[priority]}
      </Checkbox>
    ))}
  </div>
</FilterSection>
```

### Financeiro (Receivables/Payables)

```tsx
// Filtros disponíveis
const financialFilters = {
  status: ['pending', 'paid', 'overdue', 'cancelled'],
  dueDateFrom: 'date',
  dueDateTo: 'date',
  minAmount: 'number',
  maxAmount: 'number',
  paymentMethod: ['credit_card', 'debit_card', 'pix', 'cash', 'bank_transfer'],
};

// No drawer
<FilterSection title="Status de Pagamento">
  <Select
    value={filters.status as string}
    onValueChange={(value) => setFilter('status', value)}
  >
    <SelectItem value="pending">Pendente</SelectItem>
    <SelectItem value="paid">Pago</SelectItem>
    <SelectItem value="overdue">Vencido</SelectItem>
  </Select>
</FilterSection>

<FilterSection title="Período de Vencimento">
  <Input
    type="date"
    value={filters.dueDateFrom || ''}
    onChange={(e) => setFilter('dueDateFrom', e.target.value)}
  />
  <Input
    type="date"
    value={filters.dueDateTo || ''}
    onChange={(e) => setFilter('dueDateTo', e.target.value)}
  />
</FilterSection>
```

## Integração com React Query

### Buscar dados filtrados do backend

```tsx
import { useQuery } from '@tanstack/react-query';
import { useUrlFilters } from '@/hooks/useUrlFilters';

function MyPage() {
  const { filters } = useUrlFilters();

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', filters], // Inclui filters na key
    queryFn: () => customersApi.findAll(filters),
    keepPreviousData: true, // Mantém dados anteriores durante loading
  });

  return (
    <div>
      {isLoading && <LoadingSkeleton />}
      {data && <DataTable data={data} />}
    </div>
  );
}
```

### API Client (exemplo)

```tsx
// lib/api/customers.ts
export const customersApi = {
  findAll: async (filters?: Record<string, any>) => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const response = await axios.get(`/api/customers?${params.toString()}`);
    return response.data;
  },
};
```

## Boas Práticas

### 1. Labels Amigáveis nos Chips

```tsx
const getFilterLabel = (key: string, value: any): string => {
  const labels: Record<string, Record<string, string>> = {
    status: {
      active: 'Ativo',
      inactive: 'Inativo',
    },
    type: {
      company: 'Empresa',
      individual: 'Pessoa Física',
    },
  };

  return labels[key]?.[value] || String(value);
};

// Uso
<FilterChip
  label="Status"
  value={getFilterLabel('status', filters.status)}
  onRemove={() => removeFilter('status')}
/>
```

### 2. Validação de Filtros

```tsx
const setFilterWithValidation = (key: string, value: any) => {
  // Validar antes de definir
  if (key === 'minValue' && value < 0) {
    showToast.error('Valor mínimo não pode ser negativo');
    return;
  }

  setFilter(key, value);
};
```

### 3. Filtros Múltiplos (Arrays)

```tsx
// Para filtros que aceitam múltiplos valores
const toggleArrayFilter = (key: string, value: string) => {
  const current = filters[key];
  const currentArray = Array.isArray(current) ? current : [];

  if (currentArray.includes(value)) {
    // Remove
    const newArray = currentArray.filter(v => v !== value);
    setFilter(key, newArray.length > 0 ? newArray : null);
  } else {
    // Adiciona
    setFilter(key, [...currentArray, value]);
  }
};

// Uso
<Checkbox
  checked={filters.tags?.includes('important')}
  onCheckedChange={() => toggleArrayFilter('tags', 'important')}
>
  Importante
</Checkbox>
```

### 4. Persistência de Filtros

Os filtros são automaticamente persistidos na URL, então:
- Usuário pode compartilhar URLs com filtros
- Navegação back/forward funciona
- Refresh mantém os filtros

### 5. Resetar Filtros ao Navegar

```tsx
import { useEffect } from 'react';

useEffect(() => {
  // Limpa filtros ao desmontar (opcional)
  return () => {
    clearFilters();
  };
}, []);
```

## Troubleshooting

### Filtros não aparecem na URL

Verifique se os valores não estão vazios:
```tsx
// ❌ Errado
setFilter('status', ''); // Removido automaticamente

// ✅ Correto
setFilter('status', 'active');
```

### URL muito longa

Use filtros no backend ao invés de client-side:
```tsx
// Envie filtros para API
const { data } = useQuery({
  queryKey: ['customers', filters],
  queryFn: () => api.findAll(filters), // Backend filtra
});
```

### Conflito com paginação

Os parâmetros `page`, `limit`, `offset` são automaticamente preservados pelo hook.

## Performance

### Debounce em inputs de texto

```tsx
import { useDebouncedValue } from '@/hooks/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 300);

useEffect(() => {
  if (debouncedSearch) {
    setFilter('search', debouncedSearch);
  } else {
    removeFilter('search');
  }
}, [debouncedSearch]);
```

### Memoização

```tsx
const filteredData = useMemo(() => {
  // Lógica de filtro pesada
  return data.filter(/* ... */);
}, [data, filters]); // Só recalcula quando necessário
```

## Acessibilidade

Os componentes já incluem:
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

Adicione labels descritivos:
```tsx
<FilterChip
  label="Status"
  value="Ativo"
  onRemove={() => removeFilter('status')}
  aria-label="Remover filtro de status ativo"
/>
```

## Próximos Passos

1. Implemente filtros na página desejada
2. Teste a sincronização com URL
3. Integre com React Query se necessário
4. Adicione validações customizadas
5. Ajuste labels e textos conforme UX do projeto
