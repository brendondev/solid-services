# Sistema de Filtros Avançados - Solid Service ERP

Sistema completo e reutilizável de filtros com sincronização de URL para o Solid Service ERP.

## Componentes

### 1. `useUrlFilters` (Hook)
Hook customizado que gerencia filtros na URL usando query params.

**Funcionalidades:**
- Lê filtros da URL (query params)
- Atualiza URL quando filtros mudam (shallow routing - sem reload)
- Sincroniza estado com URL automaticamente
- Remove params vazios
- Preserva parâmetros de paginação (page, limit, offset)
- Suporta tipos: string, number, boolean, arrays

**Retorno:**
```typescript
{
  filters: Filters;              // Objeto com filtros ativos
  setFilter: (key, value) => void;  // Define um filtro
  removeFilter: (key) => void;      // Remove um filtro
  clearFilters: () => void;         // Limpa todos os filtros
  hasActiveFilters: boolean;        // Indica se há filtros ativos
}
```

### 2. `FilterChip`
Componente de chip removível para exibir filtros ativos.

**Props:**
- `label`: Texto do filtro
- `value?`: Valor do filtro (opcional)
- `onRemove`: Callback ao remover
- `className?`: Classes CSS customizadas

### 3. `FilterDrawer`
Drawer/Modal responsivo para filtros avançados.

**Props:**
- `isOpen`: Controla visibilidade
- `onClose`: Callback ao fechar
- `onApply?`: Callback ao aplicar (opcional)
- `onClear?`: Callback ao limpar (opcional)
- `title?`: Título do drawer
- `description?`: Descrição
- `children`: Conteúdo (seções de filtro)
- `showFooter?`: Exibe footer com botões (default: true)

### 4. `FilterSection`
Seção de filtro dentro do drawer, agrupa filtros relacionados.

**Props:**
- `title`: Título da seção
- `description?`: Descrição opcional
- `children`: Inputs de filtro
- `className?`: Classes CSS customizadas

## Exemplo de Uso Completo

### Em uma página (ex: customers/page.tsx)

```tsx
'use client';

import { useState } from 'react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { FilterChip, FilterDrawer, FilterSection } from '@/components/filters';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

export default function CustomersPage() {
  const { filters, setFilter, removeFilter, clearFilters, hasActiveFilters } = useUrlFilters();
  const [showFilters, setShowFilters] = useState(false);

  // Exemplo: filtros para customers
  const statusFilters = ['active', 'inactive'];
  const typeFilters = ['company', 'individual'];

  return (
    <div className="space-y-6">
      {/* Botão para abrir filtros */}
      <div className="flex items-center gap-4">
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
      </div>

      {/* Chips de filtros ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>

          {filters.status && (
            <FilterChip
              label="Status"
              value={filters.status === 'active' ? 'Ativo' : 'Inativo'}
              onRemove={() => removeFilter('status')}
            />
          )}

          {filters.type && (
            <FilterChip
              label="Tipo"
              value={filters.type === 'company' ? 'Empresa' : 'Pessoa Física'}
              onRemove={() => removeFilter('type')}
            />
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto py-1 px-2 text-xs"
          >
            Limpar tudo
          </Button>
        </div>
      )}

      {/* Drawer de filtros */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onClear={clearFilters}
      >
        <FilterSection
          title="Status"
          description="Filtrar por status do cliente"
        >
          <div className="space-y-2">
            {statusFilters.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={filters.status === status}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilter('status', status);
                    } else {
                      removeFilter('status');
                    }
                  }}
                />
                <label
                  htmlFor={`status-${status}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {status === 'active' ? 'Ativo' : 'Inativo'}
                </label>
              </div>
            ))}
          </div>
        </FilterSection>

        <FilterSection
          title="Tipo de Cliente"
          description="Filtrar por tipo de pessoa"
        >
          <Select
            value={filters.type as string || ''}
            onValueChange={(value) => {
              if (value) {
                setFilter('type', value);
              } else {
                removeFilter('type');
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="company">Empresa</SelectItem>
              <SelectItem value="individual">Pessoa Física</SelectItem>
            </SelectContent>
          </Select>
        </FilterSection>
      </FilterDrawer>

      {/* Sua tabela de dados aqui */}
      <DataTable data={filteredData} columns={columns} />
    </div>
  );
}
```

## Uso com TanStack Table

```tsx
import { useUrlFilters } from '@/hooks/useUrlFilters';

// No componente
const { filters } = useUrlFilters();

// Aplicar filtros nos dados
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

// Passar para tabela
<DataTable data={filteredData} columns={columns} />
```

## Características Técnicas

- **TypeScript**: Totalmente tipado
- **Next.js 14 App Router**: Usa useSearchParams, useRouter, usePathname
- **Shallow Routing**: Atualiza URL sem recarregar página
- **URL Limpa**: Remove params vazios automaticamente
- **Responsivo**: Drawer no mobile, modal no desktop
- **Acessível**: ARIA labels, keyboard navigation
- **Reutilizável**: Funciona em qualquer página do sistema

## Tipos Suportados

O hook `useUrlFilters` suporta os seguintes tipos de valores:

- **String**: `setFilter('name', 'João')`
- **Number**: `setFilter('age', 25)`
- **Boolean**: `setFilter('active', true)`
- **Array**: `setFilter('tags', ['tag1', 'tag2'])` (serializado como CSV na URL)

## URL Format

Exemplos de URLs geradas:

```
/dashboard/customers?status=active
/dashboard/customers?status=active&type=company
/dashboard/customers?status=active&tags=tag1,tag2
/dashboard/customers?page=2&status=active (paginação preservada)
```

## Integração com Backend

```tsx
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useQuery } from '@tanstack/react-query';

function MyPage() {
  const { filters } = useUrlFilters();

  const { data } = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customersApi.findAll(filters),
  });

  // React Query refetcha automaticamente quando filters mudam
}
```

## Notas

- Os parâmetros de paginação (`page`, `limit`, `offset`) são preservados automaticamente
- Filtros vazios são removidos da URL
- Arrays são serializados como CSV (comma-separated values)
- O hook usa `router.replace()` com `scroll: false` para evitar scroll ao topo
