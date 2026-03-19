/**
 * EXEMPLO DE USO COMPLETO - Sistema de Filtros Avançados
 *
 * Este arquivo demonstra como integrar o sistema de filtros
 * em uma página do Solid Service ERP
 *
 * Para usar em sua página, copie e adapte conforme necessário
 */

'use client';

import { useState, useMemo } from 'react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { FilterChip, FilterDrawer, FilterSection } from '@/components/filters';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Filter, X } from 'lucide-react';

// Exemplo de dados
interface Customer {
  id: string;
  name: string;
  type: 'company' | 'individual';
  status: 'active' | 'inactive';
  document?: string;
}

export default function CustomersPageWithFilters() {
  const { filters, setFilter, removeFilter, clearFilters, hasActiveFilters } = useUrlFilters();
  const [showFilters, setShowFilters] = useState(false);

  // Exemplo de dados mockados
  const [customers] = useState<Customer[]>([
    { id: '1', name: 'Empresa A', type: 'company', status: 'active', document: '12345678000190' },
    { id: '2', name: 'João Silva', type: 'individual', status: 'active', document: '12345678901' },
    { id: '3', name: 'Empresa B', type: 'company', status: 'inactive', document: '98765432000111' },
  ]);

  // Aplicar filtros aos dados
  const filteredCustomers = useMemo(() => {
    let result = customers;

    // Filtro de status
    if (filters.status) {
      result = result.filter(c => c.status === filters.status);
    }

    // Filtro de tipo
    if (filters.type) {
      result = result.filter(c => c.type === filters.type);
    }

    // Filtro de busca por nome
    if (filters.search && typeof filters.search === 'string') {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [customers, filters]);

  // Labels para exibição nos chips
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            {filteredCustomers.length} de {customers.length} clientes
          </p>
        </div>

        <Button onClick={() => console.log('Novo cliente')}>
          Novo Cliente
        </Button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex items-center gap-4">
        {/* Busca rápida */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar por nome..."
            value={(filters.search as string) || ''}
            onChange={(e) => setFilter('search', e.target.value)}
          />
        </div>

        {/* Botão Filtros Avançados */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(true)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros Avançados
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs font-semibold">
              {Object.keys(filters).filter(k => k !== 'search').length}
            </span>
          )}
        </Button>
      </div>

      {/* Chips de Filtros Ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg border">
          <span className="text-sm font-medium text-muted-foreground">
            Filtros ativos:
          </span>

          {/* Chip de Status */}
          {filters.status && (
            <FilterChip
              label="Status"
              value={getFilterLabel('status', filters.status)}
              onRemove={() => removeFilter('status')}
            />
          )}

          {/* Chip de Tipo */}
          {filters.type && (
            <FilterChip
              label="Tipo"
              value={getFilterLabel('type', filters.type)}
              onRemove={() => removeFilter('type')}
            />
          )}

          {/* Chip de Busca */}
          {filters.search && (
            <FilterChip
              label="Busca"
              value={filters.search as string}
              onRemove={() => removeFilter('search')}
            />
          )}

          {/* Botão Limpar Tudo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto py-1 px-2 text-xs gap-1 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-3 w-3" />
            Limpar tudo
          </Button>
        </div>
      )}

      {/* Drawer de Filtros Avançados */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onClear={clearFilters}
        title="Filtros Avançados"
        description="Refine sua busca com filtros personalizados"
      >
        {/* Seção: Status */}
        <FilterSection
          title="Status do Cliente"
          description="Filtrar por status ativo ou inativo"
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-active"
                checked={filters.status === 'active'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilter('status', 'active');
                  } else {
                    removeFilter('status');
                  }
                }}
              />
              <label
                htmlFor="status-active"
                className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ativo
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-inactive"
                checked={filters.status === 'inactive'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilter('status', 'inactive');
                  } else {
                    removeFilter('status');
                  }
                }}
              />
              <label
                htmlFor="status-inactive"
                className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Inativo
              </label>
            </div>
          </div>
        </FilterSection>

        {/* Seção: Tipo */}
        <FilterSection
          title="Tipo de Pessoa"
          description="Filtrar por pessoa física ou jurídica"
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="type-company"
                checked={filters.type === 'company'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilter('type', 'company');
                  } else {
                    removeFilter('type');
                  }
                }}
              />
              <label
                htmlFor="type-company"
                className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Pessoa Jurídica (Empresa)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="type-individual"
                checked={filters.type === 'individual'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilter('type', 'individual');
                  } else {
                    removeFilter('type');
                  }
                }}
              />
              <label
                htmlFor="type-individual"
                className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Pessoa Física
              </label>
            </div>
          </div>
        </FilterSection>

        {/* Você pode adicionar mais seções conforme necessário */}
      </FilterDrawer>

      {/* Lista de Resultados */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Resultados</h2>

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum cliente encontrado com os filtros selecionados.</p>
            <Button
              variant="link"
              onClick={clearFilters}
              className="mt-2"
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {customer.document}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      customer.type === 'company'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {customer.type === 'company' ? 'Empresa' : 'PF'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      customer.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Info (remover em produção) */}
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-xs font-mono">
          URL Filters: {JSON.stringify(filters, null, 2)}
        </p>
      </div>
    </div>
  );
}

/**
 * INTEGRAÇÃO COM REACT QUERY (Backend)
 *
 * Para buscar dados filtrados do backend:
 *
 * ```tsx
 * import { useQuery } from '@tanstack/react-query';
 * import { customersApi } from '@/lib/api/customers';
 * import { useUrlFilters } from '@/hooks/useUrlFilters';
 *
 * function CustomersPage() {
 *   const { filters } = useUrlFilters();
 *
 *   const { data, isLoading } = useQuery({
 *     queryKey: ['customers', filters],
 *     queryFn: () => customersApi.findAll(filters),
 *   });
 *
 *   // React Query refetcha automaticamente quando filters mudam!
 * }
 * ```
 */
