'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { financialApi, Payable } from '@/lib/api/financial';
import { showToast } from '@/lib/toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  Plus,
  Receipt,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  MoreHorizontal,
  Search,
  DollarSign,
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

export default function PayablesPage() {
  const router = useRouter();
  const [data, setData] = useState<Payable[]>([]);
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
    loadPayables();
  }, []);

  const loadPayables = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await financialApi.findAllPayables(1, 1000);
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar contas a pagar');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reason?: string) => {
    if (!deleteDialog.id) return;

    try {
      setIsDeleting(true);
      setDeleteErrorLinks([]);
      await financialApi.removePayable(deleteDialog.id);
      showToast.success('Conta a pagar excluída com sucesso');
      setDeleteDialog({ isOpen: false, id: null });
      await loadPayables();
    } catch (err: any) {
      const errorData = err.response?.data;
      showToast.error(errorData?.message || 'Erro ao excluir conta a pagar');

      if (errorData?.links && Array.isArray(errorData.links)) {
        setDeleteErrorLinks(errorData.links);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePayPayable = async (id: string, amount: number) => {
    try {
      await financialApi.registerPayablePayment(id, {
        amount,
        method: 'cash',
        paidAt: new Date().toISOString(),
      });
      showToast.success('Pagamento registrado com sucesso');
      await loadPayables();
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Erro ao registrar pagamento');
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
    const pending = data.filter(p => p.status === 'pending').length;
    const paid = data.filter(p => p.status === 'paid').length;
    const totalPending = data
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + (Number(p.amount) - Number(p.paidAmount)), 0);

    return { total, pending, paid, totalPending };
  };

  // Define columns
  const columns = useMemo<ColumnDef<Payable>[]>(
    () => [
      {
        accessorKey: 'description',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Descrição" />
        ),
        cell: ({ row }) => {
          const payable = row.original;
          return (
            <Link
              href={`/dashboard/payables/${payable.id}`}
              className="font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {payable.description}
            </Link>
          );
        },
      },
      {
        accessorKey: 'supplier.name',
        header: 'Fornecedor',
        cell: ({ row }) => {
          const payable = row.original;
          return payable.supplier ? (
            <Badge variant="outline">
              {payable.supplier.name}
            </Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Valor" />
        ),
        cell: ({ row }) => {
          const amount = Number(row.getValue('amount'));
          return <span className="font-medium">{formatCurrency(amount)}</span>;
        },
      },
      {
        accessorKey: 'dueDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Vencimento" />
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
          const statusConfig = {
            pending: {
              label: 'Pendente',
              className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80',
            },
            paid: {
              label: 'Pago',
              className: 'bg-green-100 text-green-800 hover:bg-green-100/80',
            },
            overdue: {
              label: 'Vencido',
              className: 'bg-red-100 text-red-800 hover:bg-red-100/80',
            },
          };
          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
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
        id: 'actions',
        cell: ({ row }) => {
          const payable = row.original;

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
                    router.push(`/dashboard/payables/${payable.id}`);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </DropdownMenuItem>
                {payable.status === 'pending' && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      const remainingAmount = payable.amount - payable.paidAmount;
                      handlePayPayable(payable.id, remainingAmount);
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marcar como pago
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialog({ isOpen: true, id: payable.id });
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

    return data.filter((payable) =>
      payable.description.toLowerCase().includes(globalFilter.toLowerCase()) ||
      payable.supplier?.name?.toLowerCase().includes(globalFilter.toLowerCase())
    );
  }, [data, globalFilter]);

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
            <div key={i} className="bg-white p-6 rounded-lg shadow border border-border">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-border">
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="bg-white rounded-lg shadow border border-border">
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
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contas a Pagar</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas despesas e fornecedores</p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/payables/new')}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Conta a Pagar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Contas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-warning mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pagas</p>
              <p className="text-2xl font-bold text-success mt-1">{stats.paid}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total Pendente</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalPending)}</p>
            </div>
            <div className="p-3 bg-accent rounded-lg">
              <DollarSign className="w-6 h-6 text-accent-foreground" />
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
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contas por descrição ou fornecedor..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" disabled>
          Filtros Avançados
        </Button>
      </div>

      {/* Data Table or Empty State */}
      {filteredData.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow border border-border p-12 text-center">
          <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900 mb-2">
            {data.length === 0 ? 'Nenhuma conta a pagar encontrada' : 'Nenhum resultado encontrado'}
          </p>
          <p className="text-muted-foreground mb-6">
            {data.length === 0
              ? 'Comece registrando sua primeira conta'
              : 'Tente ajustar os filtros de busca'}
          </p>
          {data.length === 0 && (
            <Button
              onClick={() => router.push('/dashboard/payables/new')}
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Registrar Primeira Conta
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-border p-6">
          <DataTable
            columns={columns}
            data={filteredData}
            onRowClick={(row) => router.push(`/dashboard/payables/${row.id}`)}
          />
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Excluir Conta a Pagar Permanentemente"
        message="⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL e a conta a pagar será excluída permanentemente do banco de dados."
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
