'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi, ServiceOrder } from '@/lib/api/orders';
import { showToast } from '@/lib/toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  Plus,
  ClipboardList,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  PlayCircle,
  XCircle,
  Calendar,
  UserCircle,
  MoreHorizontal,
  Search,
  LayoutGrid,
  Table as TableIcon,
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
import { KanbanBoard } from '@/components/kanban/kanban-board';
import type { KanbanOrder } from '@/components/kanban/kanban-column';

export default function OrdersPage() {
  const router = useRouter();
  const [data, setData] = useState<ServiceOrder[]>([]);
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

  // View mode state (table or kanban)
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await ordersApi.findAll();
      setData(Array.isArray(result) ? result : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar ordens');
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
      await ordersApi.remove(deleteDialog.id);
      showToast.success('Ordem de serviço excluída com sucesso');
      setDeleteDialog({ isOpen: false, id: null });
      await loadOrders();
    } catch (err: any) {
      const errorData = err.response?.data;
      showToast.error(errorData?.message || 'Erro ao excluir ordem de serviço');

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

  const getStats = () => {
    const total = data.length;
    const open = data.filter(o => o.status === 'open').length;
    const inProgress = data.filter(o => o.status === 'in_progress').length;
    const completed = data.filter(o => o.status === 'completed').length;

    return { total, open, inProgress, completed };
  };

  // Mapeia ServiceOrder para KanbanOrder
  const mapToKanbanOrder = (order: ServiceOrder): KanbanOrder => ({
    id: order.id,
    title: `#${order.number}`,
    customer: order.customer?.name || 'Cliente não informado',
    technician: order.assignedUser?.name,
    dueDate: order.scheduledFor || undefined,
    priority: 'medium', // Pode ser expandido para incluir prioridade real
    value: Number(order.totalAmount),
    status: order.status,
  });

  // Colunas do Kanban
  const kanbanColumns = [
    { id: 'open', title: 'Aberta' },
    { id: 'scheduled', title: 'Agendada' },
    { id: 'in_progress', title: 'Em Andamento' },
    { id: 'completed', title: 'Concluída' },
    { id: 'cancelled', title: 'Cancelada' },
  ];

  // Define columns
  const columns = useMemo<ColumnDef<ServiceOrder>[]>(
    () => [
      {
        accessorKey: 'number',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Número" />
        ),
        cell: ({ row }) => {
          const order = row.original;
          return (
            <Link
              href={`/dashboard/orders/${order.id}`}
              className="font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {order.number}
            </Link>
          );
        },
      },
      {
        accessorKey: 'customer.name',
        header: 'Cliente',
        cell: ({ row }) => {
          const customerName = row.original.customer?.name || '-';
          return (
            <Badge variant="secondary">
              {customerName}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          const statusConfig: Record<string, { label: string; className: string }> = {
            open: {
              label: 'Aberta',
              className: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80',
            },
            scheduled: {
              label: 'Agendada',
              className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80',
            },
            in_progress: {
              label: 'Em Andamento',
              className: 'bg-orange-100 text-orange-800 hover:bg-orange-100/80',
            },
            completed: {
              label: 'Concluída',
              className: 'bg-green-100 text-green-800 hover:bg-green-100/80',
            },
            cancelled: {
              label: 'Cancelada',
              className: 'bg-red-100 text-red-800 hover:bg-red-100/80',
            },
          };
          const config = statusConfig[status] || statusConfig.open;
          return (
            <Badge variant="default" className={config.className}>
              {config.label}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'assignedUser.name',
        header: 'Técnico Responsável',
        cell: ({ row }) => {
          const technicianName = row.original.assignedUser?.name || 'Não atribuído';
          return <span className="text-sm">{technicianName}</span>;
        },
      },
      {
        accessorKey: 'scheduledFor',
        header: 'Data Agendada',
        cell: ({ row }) => {
          const scheduledFor = row.getValue('scheduledFor') as string | null;
          return scheduledFor
            ? new Date(scheduledFor).toLocaleDateString('pt-BR')
            : '-';
        },
      },
      {
        accessorKey: 'totalAmount',
        header: 'Valor Total',
        cell: ({ row }) => {
          const amount = row.getValue('totalAmount') as number;
          return (
            <span className="font-medium text-green-600">
              {formatCurrency(Number(amount))}
            </span>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const order = row.original;

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
                    router.push(`/dashboard/orders/${order.id}`);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/orders/${order.id}/edit`);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialog({ isOpen: true, id: order.id });
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

    return data.filter((order) =>
      order.number.toLowerCase().includes(globalFilter.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(globalFilter.toLowerCase())
    );
  }, [data, globalFilter]);

  // Dados para o Kanban (depois de filteredData)
  const kanbanOrders: KanbanOrder[] = useMemo(() => {
    return filteredData.map(mapToKanbanOrder);
  }, [filteredData]);

  // Callback quando uma ordem é movida no Kanban
  const handleOrderMove = async (orderId: string, newStatus: string) => {
    try {
      await ordersApi.update(orderId, {
        status: newStatus as any,
      });
      showToast.success('Status atualizado com sucesso');
      await loadOrders();
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Erro ao atualizar status');
      await loadOrders(); // Recarrega para reverter mudança visual
    }
  };

  // Callback quando um card do Kanban é clicado
  const handleKanbanCardClick = (order: KanbanOrder) => {
    router.push(`/dashboard/orders/${order.id}`);
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Ordens de Serviço</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Gerencie as ordens de trabalho</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-border bg-background p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="gap-2"
            >
              <TableIcon className="h-4 w-4" />
              Tabela
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </Button>
          </div>
          <Button
            onClick={() => router.push('/dashboard/orders/new')}
            className="min-h-[44px] flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Ordem
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total de Ordens</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Abertas</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{stats.open}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Em Andamento</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-1">{stats.inProgress}</p>
            </div>
            <div className="p-2 sm:p-3 bg-orange-500/10 rounded-lg">
              <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Concluídas</p>
              <p className="text-xl sm:text-2xl font-bold text-success mt-1">{stats.completed}</p>
            </div>
            <div className="p-2 sm:p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Bar - Only show search in table mode */}
      {viewMode === 'table' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar ordens..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-10 h-11 text-base sm:text-sm"
            />
          </div>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="bg-card rounded-lg shadow border border-border p-4">
          {kanbanOrders.length === 0 ? (
            <div className="p-6 sm:p-12 text-center">
              <ClipboardList className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                Nenhuma ordem encontrada
              </p>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                Comece criando sua primeira ordem de serviço
              </p>
              <Button
                onClick={() => router.push('/dashboard/orders/new')}
                className="min-h-[44px] inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Criar Primeira Ordem
              </Button>
            </div>
          ) : (
            <KanbanBoard
              columns={kanbanColumns}
              orders={kanbanOrders}
              onOrderMove={handleOrderMove}
              onCardClick={handleKanbanCardClick}
            />
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <>
          {filteredData.length === 0 && !loading ? (
            <div className="bg-card rounded-lg shadow border border-border p-6 sm:p-12 text-center">
              <ClipboardList className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                {data.length === 0 ? 'Nenhuma ordem encontrada' : 'Nenhum resultado encontrado'}
              </p>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                {data.length === 0
                  ? 'Comece criando sua primeira ordem de serviço'
                  : 'Tente ajustar os filtros de busca'}
              </p>
              {data.length === 0 && (
                <Button
                  onClick={() => router.push('/dashboard/orders/new')}
                  className="min-h-[44px] inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Criar Primeira Ordem
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-card rounded-lg shadow border border-border p-3 sm:p-6">
              <DataTable
                columns={columns}
                data={filteredData}
                onRowClick={(row) => router.push(`/dashboard/orders/${row.id}`)}
              />
            </div>
          )}
        </>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Excluir Ordem de Serviço Permanentemente"
        message="⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL e a ordem de serviço será excluída permanentemente do banco de dados."
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
