# Casos de Uso Avançados - Sistema de Filtros

## 1. Filtros com Múltiplos Valores (Arrays)

### Cenário: Filtrar por múltiplos status simultaneamente

```tsx
import { useUrlFilters } from '@/hooks/useUrlFilters';

function OrdersPage() {
  const { filters, setFilter } = useUrlFilters();

  // Função helper para gerenciar arrays
  const toggleArrayFilter = (key: string, value: string) => {
    const current = filters[key];
    const currentArray = Array.isArray(current) ? current : [];

    if (currentArray.includes(value)) {
      // Remove o valor
      const newArray = currentArray.filter(v => v !== value);
      setFilter(key, newArray.length > 0 ? newArray : null);
    } else {
      // Adiciona o valor
      setFilter(key, [...currentArray, value]);
    }
  };

  return (
    <FilterSection title="Status">
      {['open', 'in_progress', 'completed'].map(status => (
        <Checkbox
          key={status}
          checked={filters.status?.includes(status)}
          onCheckedChange={() => toggleArrayFilter('status', status)}
        >
          {status}
        </Checkbox>
      ))}
    </FilterSection>
  );
}

// URL gerada: ?status=open,in_progress,completed
```

## 2. Filtros de Data com Range

### Cenário: Filtrar por período de datas

```tsx
import { format } from 'date-fns';

function FinancialPage() {
  const { filters, setFilter, removeFilter } = useUrlFilters();

  const handleDateRangeChange = (from: Date | null, to: Date | null) => {
    if (from) {
      setFilter('dateFrom', format(from, 'yyyy-MM-dd'));
    } else {
      removeFilter('dateFrom');
    }

    if (to) {
      setFilter('dateTo', format(to, 'yyyy-MM-dd'));
    } else {
      removeFilter('dateTo');
    }
  };

  return (
    <FilterSection title="Período">
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="date"
          value={filters.dateFrom || ''}
          onChange={(e) => setFilter('dateFrom', e.target.value)}
          placeholder="Data inicial"
        />
        <Input
          type="date"
          value={filters.dateTo || ''}
          onChange={(e) => setFilter('dateTo', e.target.value)}
          placeholder="Data final"
        />
      </div>

      {/* Atalhos rápidos */}
      <div className="flex gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const today = new Date();
            setFilter('dateFrom', format(today, 'yyyy-MM-dd'));
            setFilter('dateTo', format(today, 'yyyy-MM-dd'));
          }}
        >
          Hoje
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            setFilter('dateFrom', format(weekAgo, 'yyyy-MM-dd'));
            setFilter('dateTo', format(today, 'yyyy-MM-dd'));
          }}
        >
          Últimos 7 dias
        </Button>
      </div>
    </FilterSection>
  );
}
```

## 3. Filtros Numéricos com Range

### Cenário: Filtrar por faixa de valores

```tsx
function QuotationsPage() {
  const { filters, setFilter, removeFilter } = useUrlFilters();

  return (
    <FilterSection title="Valor do Orçamento">
      <div className="space-y-2">
        <Input
          type="number"
          placeholder="Valor mínimo (R$)"
          value={filters.minValue || ''}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              setFilter('minValue', Number(value));
            } else {
              removeFilter('minValue');
            }
          }}
        />
        <Input
          type="number"
          placeholder="Valor máximo (R$)"
          value={filters.maxValue || ''}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              setFilter('maxValue', Number(value));
            } else {
              removeFilter('maxValue');
            }
          }}
        />
      </div>

      {/* Ranges pré-definidos */}
      <div className="flex flex-wrap gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFilter('minValue', 0);
            setFilter('maxValue', 1000);
          }}
        >
          Até R$ 1.000
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFilter('minValue', 1000);
            setFilter('maxValue', 5000);
          }}
        >
          R$ 1.000 - 5.000
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFilter('minValue', 5000);
            removeFilter('maxValue');
          }}
        >
          Acima de R$ 5.000
        </Button>
      </div>
    </FilterSection>
  );
}
```

## 4. Busca com Debounce

### Cenário: Busca em tempo real sem sobrecarregar

```tsx
import { useState, useEffect } from 'react';

// Hook de debounce (criar em hooks/useDebounce.ts)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Uso no componente
function CustomersPage() {
  const { filters, setFilter, removeFilter } = useUrlFilters();
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    if (debouncedSearch) {
      setFilter('search', debouncedSearch);
    } else {
      removeFilter('search');
    }
  }, [debouncedSearch]);

  return (
    <Input
      placeholder="Buscar clientes..."
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
    />
  );
}
```

## 5. Filtros Condicionais (Dependentes)

### Cenário: Filtros que dependem de outros

```tsx
function OrdersPage() {
  const { filters, setFilter, removeFilter } = useUrlFilters();

  // Quando seleciona "completed", mostra filtro de data de conclusão
  const showCompletionDate = filters.status === 'completed';

  return (
    <>
      <FilterSection title="Status">
        <Select
          value={filters.status as string || ''}
          onValueChange={(value) => {
            setFilter('status', value);
            // Remove filtros dependentes ao mudar status
            if (value !== 'completed') {
              removeFilter('completedFrom');
              removeFilter('completedTo');
            }
          }}
        >
          <SelectItem value="open">Aberto</SelectItem>
          <SelectItem value="completed">Concluído</SelectItem>
        </Select>
      </FilterSection>

      {/* Filtro condicional */}
      {showCompletionDate && (
        <FilterSection title="Data de Conclusão">
          <Input
            type="date"
            value={filters.completedFrom || ''}
            onChange={(e) => setFilter('completedFrom', e.target.value)}
          />
        </FilterSection>
      )}
    </>
  );
}
```

## 6. Filtros Salvos (Favoritos)

### Cenário: Permitir que usuário salve combinações de filtros

```tsx
import { useState } from 'react';

interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, any>;
}

function CustomersPage() {
  const { filters, setFilter } = useUrlFilters();
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([
    {
      id: '1',
      name: 'Empresas Ativas',
      filters: { type: 'company', status: 'active' },
    },
    {
      id: '2',
      name: 'Pessoas Físicas',
      filters: { type: 'individual' },
    },
  ]);

  const applySavedFilter = (saved: SavedFilter) => {
    // Aplica todos os filtros salvos
    Object.entries(saved.filters).forEach(([key, value]) => {
      setFilter(key, value);
    });
  };

  const saveCurrentFilters = (name: string) => {
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filters: { ...filters },
    };
    setSavedFilters([...savedFilters, newFilter]);

    // Salvar no localStorage
    localStorage.setItem('savedFilters', JSON.stringify([...savedFilters, newFilter]));
  };

  return (
    <FilterSection title="Filtros Salvos">
      <div className="space-y-2">
        {savedFilters.map(saved => (
          <Button
            key={saved.id}
            variant="outline"
            size="sm"
            onClick={() => applySavedFilter(saved)}
            className="w-full justify-start"
          >
            {saved.name}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const name = prompt('Nome do filtro:');
          if (name) saveCurrentFilters(name);
        }}
      >
        Salvar Filtros Atuais
      </Button>
    </FilterSection>
  );
}
```

## 7. Filtros com Autocomplete

### Cenário: Buscar e selecionar de uma lista grande

```tsx
import { useState } from 'react';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';

function OrdersPage() {
  const { filters, setFilter } = useUrlFilters();
  const [customers] = useState([
    { id: '1', name: 'Empresa A' },
    { id: '2', name: 'Empresa B' },
    // ... mais clientes
  ]);

  return (
    <FilterSection title="Cliente">
      <Command>
        <CommandInput placeholder="Buscar cliente..." />
        <CommandList>
          {customers.map(customer => (
            <CommandItem
              key={customer.id}
              onSelect={() => setFilter('customerId', customer.id)}
            >
              {customer.name}
            </CommandItem>
          ))}
        </CommandList>
      </Command>

      {/* Exibe cliente selecionado */}
      {filters.customerId && (
        <div className="mt-2">
          <FilterChip
            label="Cliente"
            value={customers.find(c => c.id === filters.customerId)?.name}
            onRemove={() => removeFilter('customerId')}
          />
        </div>
      )}
    </FilterSection>
  );
}
```

## 8. Integração com Backend (Server-Side Filtering)

### Cenário: Filtros processados no servidor

```tsx
import { useQuery } from '@tanstack/react-query';
import { useUrlFilters } from '@/hooks/useUrlFilters';

function CustomersPage() {
  const { filters } = useUrlFilters();

  // React Query busca dados filtrados do backend
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      // Serializa filtros para query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });

      const response = await fetch(`/api/customers?${params.toString()}`);
      return response.json();
    },
    keepPreviousData: true, // Mantém dados anteriores durante loading
  });

  return (
    <div>
      {isFetching && <div>Atualizando...</div>}
      <DataTable data={data?.items || []} />
    </div>
  );
}

// No backend (Next.js API Route)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const filters = {
    status: searchParams.get('status'),
    type: searchParams.get('type'),
    search: searchParams.get('search'),
  };

  // Aplica filtros no banco de dados
  const customers = await prisma.customer.findMany({
    where: {
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { document: { contains: filters.search } },
        ],
      }),
    },
  });

  return Response.json({ items: customers });
}
```

## 9. Contadores de Resultados por Filtro

### Cenário: Mostrar quantos resultados cada filtro retorna

```tsx
function CustomersPage() {
  const { filters, setFilter } = useUrlFilters();
  const [data] = useState(customersData);

  // Calcula contadores
  const getCounts = () => {
    return {
      active: data.filter(c => c.status === 'active').length,
      inactive: data.filter(c => c.status === 'inactive').length,
      company: data.filter(c => c.type === 'company').length,
      individual: data.filter(c => c.type === 'individual').length,
    };
  };

  const counts = getCounts();

  return (
    <FilterSection title="Status">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Checkbox
            checked={filters.status === 'active'}
            onCheckedChange={(checked) => {
              if (checked) setFilter('status', 'active');
              else removeFilter('status');
            }}
          >
            Ativo
          </Checkbox>
          <span className="text-xs text-muted-foreground">
            ({counts.active})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <Checkbox
            checked={filters.status === 'inactive'}
            onCheckedChange={(checked) => {
              if (checked) setFilter('status', 'inactive');
              else removeFilter('status');
            }}
          >
            Inativo
          </Checkbox>
          <span className="text-xs text-muted-foreground">
            ({counts.inactive})
          </span>
        </div>
      </div>
    </FilterSection>
  );
}
```

## 10. Exportar Dados Filtrados

### Cenário: Permitir exportação dos dados filtrados

```tsx
function CustomersPage() {
  const { filters } = useUrlFilters();
  const filteredData = useFilteredData(filters);

  const exportToCSV = () => {
    const csv = convertToCSV(filteredData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-filtered-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="flex items-center gap-2">
      <FilterDrawer {...props} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Exportar ({filteredData.length} registros)
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={exportToCSV}>
            Exportar como CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportToExcel}>
            Exportar como Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

## Performance Tips

### 1. Memoização de dados filtrados

```tsx
const filteredData = useMemo(() => {
  return data.filter(item => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.type && item.type !== filters.type) return false;
    return true;
  });
}, [data, filters]);
```

### 2. Virtualização para listas grandes

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function LargeDataTable({ data }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      {/* Renderiza apenas itens visíveis */}
    </div>
  );
}
```

### 3. Lazy loading de filtros

```tsx
import dynamic from 'next/dynamic';

// Carrega drawer apenas quando necessário
const FilterDrawer = dynamic(() => import('@/components/filters/FilterDrawer'), {
  ssr: false,
});
```

## Acessibilidade

### Anunciar mudanças para screen readers

```tsx
import { useEffect } from 'react';

function useFilterAnnouncements(filteredCount: number) {
  useEffect(() => {
    const announcement = `Mostrando ${filteredCount} resultados`;
    const liveRegion = document.getElementById('filter-announcements');

    if (liveRegion) {
      liveRegion.textContent = announcement;
    }
  }, [filteredCount]);
}

// No componente
<div
  id="filter-announcements"
  className="sr-only"
  role="status"
  aria-live="polite"
  aria-atomic="true"
/>
```
