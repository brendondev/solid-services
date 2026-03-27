'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { customersApi, Customer } from '@/lib/api/customers';
import { showToast } from '@/lib/toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { FilterChip, FilterDrawer, FilterSection } from '@/components/filters';
import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';
import {
  Plus,
  Users,
  Building2,
  User,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Search,
  Filter,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

export default function CustomersPage() {
  const router = useRouter();
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorLinks, setDeleteErrorLinks] = useState<any[]>([]);

  // Search filter state (external control)
  const [globalFilter, setGlobalFilter] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Advanced filters state
  const [showFilters, setShowFilters] = useState(false);
  const { filters, setFilter, removeFilter, clearFilters, hasActiveFilters } = useUrlFilters();

  // Registra atalhos de teclado
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

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await customersApi.findAll();
      setData(Array.isArray(result) ? result : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar clientes');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reason?: string) => {
    if (!deleteDialog.id) return;

    try {
      setIsDeleting(true);
      setDeleteErrorLinks([]); // Limpar links anteriores
      await customersApi.remove(deleteDialog.id);
      showToast.success('Cliente excluído com sucesso');
      setDeleteDialog({ isOpen: false, id: null });
      await loadCustomers();
    } catch (err: any) {
      const errorData = err.response?.data;
      showToast.error(errorData?.message || 'Erro ao excluir cliente');

      // Capturar links de relacionamentos
      if (errorData?.links && Array.isArray(errorData.links)) {
        setDeleteErrorLinks(errorData.links);
      }
    } finally {
      setIsDeleting(false);
    }
  };


  const getStats = () => {
    const total = data.length;
    const active = data.filter(c => c.status === 'active').length;
    const companies = data.filter(c => c.type === 'company').length;
    const individuals = data.filter(c => c.type === 'individual').length;

    return { total, active, companies, individuals };
  };

  // Define columns
  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nome" />
        ),
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <Link
              href={`/dashboard/customers/${customer.id}`}
              className="font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {customer.name}
            </Link>
          );
        },
      },
      {
        accessorKey: 'type',
        header: 'Tipo',
        cell: ({ row }) => {
          const type = row.getValue('type') as string;
          return (
            <Badge variant={type === 'company' ? 'default' : 'secondary'}>
              {type === 'company' ? 'Empresa' : 'Pessoa Física'}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'document',
        header: 'CPF/CNPJ',
        cell: ({ row }) => {
          const document = row.getValue('document') as string | null;
          return document || '-';
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <Badge
              variant={status === 'active' ? 'default' : 'secondary'}
              className={
                status === 'active'
                  ? 'bg-green-100 text-green-800 hover:bg-green-100/80'
                  : ''
              }
            >
              {status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const customer = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/customers/${customer.id}`);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/customers/${customer.id}/edit`);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialog({ isOpen: true, id: customer.id });
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router]
  );

  const stats = getStats();

  // Filter data based on global filter and advanced filters
  const filteredData = useMemo(() => {
    let result = data;

    // Filtro de busca global
    if (globalFilter) {
      result = result.filter((customer) =>
        customer.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        customer.document?.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }

    // Filtros avançados
    if (filters.status) {
      result = result.filter((customer) => customer.status === filters.status);
    }

    if (filters.type) {
      result = result.filter((customer) => customer.type === filters.type);
    }

    return result;
  }, [data, globalFilter, filters]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-fadeInUp">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-5 w-64 mt-2" />
          </div>
          <Skeleton className="h-11 w-40" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card p-6 rounded-lg shadow border border-border">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        <div className="bg-card p-4 rounded-lg shadow border border-border">
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="bg-card rounded-lg shadow border border-border">
          <div className="p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Gerencie sua base de clientes</p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/customers/new')}
          className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total de Clientes</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Clientes Ativos</p>
              <p className="text-xl sm:text-2xl font-bold text-success mt-1">{stats.active}</p>
            </div>
            <div className="p-2 sm:p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Empresas</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{stats.companies}</p>
            </div>
            <div className="p-2 sm:p-3 bg-accent rounded-lg">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Pessoas Físicas</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{stats.individuals}</p>
            </div>
            <div className="p-2 sm:p-3 bg-secondary rounded-lg">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-foreground" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
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
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar tudo
          </Button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={searchInputRef}
            placeholder="Buscar clientes..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10 h-11 text-base sm:text-sm"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(true)}
          className="relative min-h-[44px] whitespace-nowrap"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <Badge className="ml-2 min-w-[20px] h-5">{Object.keys(filters).length}</Badge>
          )}
        </Button>
      </div>

      {/* Data Table or Empty State */}
      {filteredData.length === 0 && !loading ? (
        <div className="bg-card rounded-lg shadow border border-border p-6 sm:p-12 text-center">
          <Users className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            {data.length === 0 ? 'Nenhum cliente encontrado' : 'Nenhum resultado encontrado'}
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            {data.length === 0
              ? 'Comece adicionando seu primeiro cliente'
              : 'Tente ajustar os filtros de busca'}
          </p>
          {data.length === 0 && (
            <Button
              onClick={() => router.push('/dashboard/customers/new')}
              className="min-h-[44px] inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Adicionar Primeiro Cliente
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow border border-border p-3 sm:p-6">
          <DataTable
            columns={columns}
            data={filteredData}
            onRowClick={(row) => router.push(`/dashboard/customers/${row.id}`)}
          />
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Excluir Cliente Permanentemente"
        message="⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL e o cliente será excluído permanentemente do banco de dados. Só é possível excluir clientes que não possuem orçamentos, ordens ou recebíveis associados. Se você deseja apenas desativar o cliente, use o botão de ativar/desativar ao invés de excluir."
        confirmText="Sim, excluir permanentemente"
        cancelText="Cancelar"
        variant="danger"
        requireReason={true}
        reasonLabel="Motivo da exclusão"
        reasonPlaceholder="Informe o motivo para fins de auditoria..."
        isLoading={isDeleting}
        errorLinks={deleteErrorLinks}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialog({ isOpen: false, id: null });
          setDeleteErrorLinks([]);
        }}
      />

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onClear={clearFilters}
      >
        <FilterSection title="Status" description="Filtrar por status do cliente">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-active"
                checked={filters.status === 'active'}
                onCheckedChange={(checked) => {
                  if (checked) setFilter('status', 'active');
                  else removeFilter('status');
                }}
              />
              <label
                htmlFor="status-active"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ativo
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-inactive"
                checked={filters.status === 'inactive'}
                onCheckedChange={(checked) => {
                  if (checked) setFilter('status', 'inactive');
                  else removeFilter('status');
                }}
              />
              <label
                htmlFor="status-inactive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Inativo
              </label>
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Tipo" description="Filtrar por tipo de cliente">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="type-company"
                checked={filters.type === 'company'}
                onCheckedChange={(checked) => {
                  if (checked) setFilter('type', 'company');
                  else removeFilter('type');
                }}
              />
              <label
                htmlFor="type-company"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Empresa
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="type-individual"
                checked={filters.type === 'individual'}
                onCheckedChange={(checked) => {
                  if (checked) setFilter('type', 'individual');
                  else removeFilter('type');
                }}
              />
              <label
                htmlFor="type-individual"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Pessoa Física
              </label>
            </div>
          </div>
        </FilterSection>
      </FilterDrawer>
    </div>
  );
}
