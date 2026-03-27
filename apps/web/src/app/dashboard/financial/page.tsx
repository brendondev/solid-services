'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { financialApi, Receivable } from '@/lib/api/financial';
import { showToast } from '@/lib/toast';
import { PaymentModal } from '@/components/financial/PaymentModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  Plus,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  CreditCard,
  Trash2,
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

export default function FinancialPage() {
  const router = useRouter();
  const [data, setData] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorLinks, setDeleteErrorLinks] = useState<any[]>([]);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Search filter state (external control)
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    loadReceivables();
  }, []);

  const loadReceivables = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await financialApi.findAllReceivables();
      setData(Array.isArray(result) ? result : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar recebíveis');
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
      await financialApi.removeReceivable(deleteDialog.id);
      showToast.success('Recebível excluído com sucesso');
      setDeleteDialog({ isOpen: false, id: null });
      await loadReceivables();
    } catch (err: any) {
      const errorData = err.response?.data;
      showToast.error(errorData?.message || 'Erro ao excluir recebível');

      // Capturar links de relacionamentos
      if (errorData?.links && Array.isArray(errorData.links)) {
        setDeleteErrorLinks(errorData.links);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenPaymentModal = (receivable: Receivable) => {
    setSelectedReceivable(receivable);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedReceivable(null);
  };

  const handlePaymentSuccess = async () => {
    await loadReceivables();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStats = () => {
    const total = data.length;
    const pending = data.filter(r => r.status === 'pending').length;
    const paid = data.filter(r => r.status === 'paid').length;
    const totalPending = data
      .filter(r => r.status === 'pending' || r.status === 'partial')
      .reduce((sum, r) => sum + (Number(r.amount) - Number(r.paidAmount)), 0);

    return { total, pending, paid, totalPending };
  };

  // Define columns
  const columns = useMemo<ColumnDef<Receivable>[]>(
    () => [
      {
        accessorKey: 'description',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Descrição/Cliente" />
        ),
        cell: ({ row }) => {
          const receivable = row.original;
          return (
            <div>
              <Link
                href={`/dashboard/financial/receivables/${receivable.id}`}
                className="font-medium hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {receivable.description || 'Sem descrição'}
              </Link>
              <p className="text-sm text-muted-foreground">
                {receivable.customer?.name || 'Cliente não informado'}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: 'serviceOrder.number',
        header: 'Ordem de Serviço',
        cell: ({ row }) => {
          const receivable = row.original;
          return receivable.serviceOrder?.number || '-';
        },
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Valor Total" />
        ),
        cell: ({ row }) => {
          const amount = row.getValue('amount') as number;
          return formatCurrency(Number(amount));
        },
      },
      {
        accessorKey: 'paidAmount',
        header: 'Valor Pago',
        cell: ({ row }) => {
          const paidAmount = row.getValue('paidAmount') as number;
          return (
            <span className="text-success font-medium">
              {formatCurrency(Number(paidAmount))}
            </span>
          );
        },
      },
      {
        id: 'balance',
        header: 'Saldo',
        cell: ({ row }) => {
          const receivable = row.original;
          const balance = Number(receivable.amount) - Number(receivable.paidAmount);
          return (
            <span className="text-warning font-medium">
              {formatCurrency(balance)}
            </span>
          );
        },
      },
      {
        accessorKey: 'dueDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Data de Vencimento" />
        ),
        cell: ({ row }) => {
          const dueDate = row.getValue('dueDate') as string;
          return new Date(dueDate).toLocaleDateString('pt-BR');
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          const statusConfig: Record<string, { label: string; color: string }> = {
            pending: {
              label: 'Pendente',
              color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80',
            },
            paid: {
              label: 'Pago',
              color: 'bg-green-100 text-green-800 hover:bg-green-100/80',
            },
            overdue: {
              label: 'Vencido',
              color: 'bg-red-100 text-red-800 hover:bg-red-100/80',
            },
            partial: {
              label: 'Parcial',
              color: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80',
            },
          };

          const config = statusConfig[status] || statusConfig.pending;

          return (
            <Badge variant="secondary" className={config.color}>
              {config.label}
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
          const receivable = row.original;
          const balance = Number(receivable.amount) - Number(receivable.paidAmount);

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
                    router.push(`/dashboard/financial/receivables/${receivable.id}`);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </DropdownMenuItem>
                {balance > 0 && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPaymentModal(receivable);
                    }}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Registrar Pagamento
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialog({ isOpen: true, id: receivable.id });
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

    return data.filter((receivable) =>
      receivable.description?.toLowerCase().includes(globalFilter.toLowerCase()) ||
      receivable.customer?.name?.toLowerCase().includes(globalFilter.toLowerCase())
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
    <div className="space-y-4 sm:space-y-4 p-4 sm:p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Contas a Receber</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Gerencie seus recebíveis</p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/financial/new')}
          className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Recebível
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total de Recebíveis</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Pendentes</p>
              <p className="text-xl sm:text-2xl font-bold text-warning mt-1">{stats.pending}</p>
            </div>
            <div className="p-2 sm:p-3 bg-warning/10 rounded-lg">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Recebidos</p>
              <p className="text-xl sm:text-2xl font-bold text-success mt-1">{stats.paid}</p>
            </div>
            <div className="p-2 sm:p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Valor Total Pendente</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                {formatCurrency(stats.totalPending)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-accent rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
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
            placeholder="Buscar recebíveis..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10 h-11 text-base sm:text-sm"
          />
        </div>
      </div>

      {/* Data Table or Empty State */}
      {filteredData.length === 0 && !loading ? (
        <div className="bg-card rounded-lg shadow border border-border p-6 sm:p-12 text-center">
          <DollarSign className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            {data.length === 0 ? 'Nenhum recebível encontrado' : 'Nenhum resultado encontrado'}
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            {data.length === 0
              ? 'Comece registrando seu primeiro recebível'
              : 'Tente ajustar os filtros de busca'}
          </p>
          {data.length === 0 && (
            <Button
              onClick={() => router.push('/dashboard/financial/new')}
              className="min-h-[44px] inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Registrar Primeiro Recebível
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow border border-border p-3 sm:p-6">
          <DataTable
            columns={columns}
            data={filteredData}
            onRowClick={(row) => router.push(`/dashboard/financial/receivables/${row.id}`)}
          />
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        receivable={selectedReceivable}
        onSuccess={handlePaymentSuccess}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Excluir Recebível Permanentemente"
        message="⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL e o recebível será excluído permanentemente do banco de dados."
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
