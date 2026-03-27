'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { servicesApi, Service } from '@/lib/api/services';
import { showToast } from '@/lib/toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  Plus,
  Wrench,
  Package,
  Tag,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  MoreHorizontal,
  Search,
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
import Link from 'next/link';

export default function ServicesPage() {
  const router = useRouter();
  const [data, setData] = useState<Service[]>([]);
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

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await servicesApi.findAll();
      setData(Array.isArray(result) ? result : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar serviços');
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
      await servicesApi.remove(deleteDialog.id);
      showToast.success('Serviço excluído com sucesso');
      setDeleteDialog({ isOpen: false, id: null });
      await loadServices();
    } catch (err: any) {
      const errorData = err.response?.data;
      showToast.error(errorData?.message || 'Erro ao excluir serviço');

      // Capturar links de relacionamentos
      if (errorData?.links && Array.isArray(errorData.links)) {
        setDeleteErrorLinks(errorData.links);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getStats = () => {
    const total = data.length;
    const active = data.filter(s => s.status === 'active').length;
    const categories = new Set(data.map(s => s.category).filter(Boolean)).size;
    const avgPrice = data.length > 0
      ? data.reduce((sum, s) => sum + Number(s.defaultPrice), 0) / data.length
      : 0;

    return { total, active, categories, avgPrice };
  };

  // Define columns
  const columns = useMemo<ColumnDef<Service>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nome do Serviço" />
        ),
        cell: ({ row }) => {
          const service = row.original;
          return (
            <Link
              href={`/dashboard/services/${service.id}`}
              className="font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {service.name}
            </Link>
          );
        },
      },
      {
        accessorKey: 'category',
        header: 'Categoria',
        cell: ({ row }) => {
          const category = row.getValue('category') as string | null;
          return category ? (
            <Badge variant="secondary">{category}</Badge>
          ) : (
            '-'
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'defaultPrice',
        header: 'Preço Padrão',
        cell: ({ row }) => {
          const price = row.getValue('defaultPrice') as number;
          return (
            <span className="font-semibold text-foreground">
              {formatCurrency(Number(price))}
            </span>
          );
        },
      },
      {
        accessorKey: 'estimatedDuration',
        header: 'Duração Estimada',
        cell: ({ row }) => {
          const duration = row.getValue('estimatedDuration') as number | null;
          return formatDuration(duration);
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
          const service = row.original;

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
                    router.push(`/dashboard/services/${service.id}`);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/services/${service.id}`);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialog({ isOpen: true, id: service.id });
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

  // Filter data based on global filter
  const filteredData = useMemo(() => {
    if (!globalFilter) return data;

    return data.filter((service) =>
      service.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
      service.category?.toLowerCase().includes(globalFilter.toLowerCase())
    );
  }, [data, globalFilter]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4 animate-fadeInUp">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Serviços</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Catálogo de serviços oferecidos</p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/services/new')}
          className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total de Serviços</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Ativos</p>
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
              <p className="text-xs sm:text-sm text-muted-foreground">Categorias</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{stats.categories}</p>
            </div>
            <div className="p-2 sm:p-3 bg-accent rounded-lg">
              <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Preço Médio</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                {formatCurrency(stats.avgPrice)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-success/10 rounded-lg">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar serviços..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10 h-11 text-base sm:text-sm"
          />
        </div>
      </div>

      {/* Data Table or Empty State */}
      {filteredData.length === 0 && !loading ? (
        <div className="bg-card rounded-lg shadow border border-border p-6 sm:p-12 text-center">
          <Wrench className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            {data.length === 0 ? 'Nenhum serviço encontrado' : 'Nenhum resultado encontrado'}
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            {data.length === 0
              ? 'Comece criando seu primeiro serviço'
              : 'Tente ajustar os filtros de busca'}
          </p>
          {data.length === 0 && (
            <Button
              onClick={() => router.push('/dashboard/services/new')}
              className="min-h-[44px] inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Primeiro Serviço
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow border border-border p-3 sm:p-6">
          <DataTable
            columns={columns}
            data={filteredData}
            onRowClick={(row) => router.push(`/dashboard/services/${row.id}`)}
          />
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Excluir Serviço Permanentemente"
        message="⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL e o serviço será excluído permanentemente do banco de dados. Só é possível excluir serviços que não possuem orçamentos ou ordens associados. Se você deseja apenas desativar o serviço, use o botão de ativar/desativar ao invés de excluir."
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
    </div>
  );
}
