'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { quotationsApi, Quotation } from '@/lib/api/quotations';
import { showToast } from '@/lib/toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  Plus,
  FileText,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Clock,
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

export default function QuotationsPage() {
  const router = useRouter();
  const [data, setData] = useState<Quotation[]>([]);
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
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await quotationsApi.findAll();
      setData(Array.isArray(result) ? result : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar orçamentos');
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
      await quotationsApi.remove(deleteDialog.id);
      showToast.success('Orçamento excluído com sucesso');
      setDeleteDialog({ isOpen: false, id: null });
      await loadQuotations();
    } catch (err: any) {
      const errorData = err.response?.data;
      showToast.error(errorData?.message || 'Erro ao excluir orçamento');

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
    const totalValue = data.reduce((sum, q) => sum + Number(q.totalAmount), 0);
    const approved = data.filter(q => q.status === 'approved').length;
    const pending = data.filter(q => q.status === 'draft' || q.status === 'sent').length;

    return { total, totalValue, approved, pending };
  };

  // Define columns
  const columns = useMemo<ColumnDef<Quotation>[]>(
    () => [
      {
        accessorKey: 'number',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Número" />
        ),
        cell: ({ row }) => {
          const quotation = row.original;
          return (
            <Link
              href={`/dashboard/quotations/${quotation.id}`}
              className="font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {quotation.number}
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
            draft: {
              label: 'Rascunho',
              className: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80',
            },
            sent: {
              label: 'Enviado',
              className: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80',
            },
            approved: {
              label: 'Aprovado',
              className: 'bg-green-100 text-green-800 hover:bg-green-100/80',
            },
            rejected: {
              label: 'Rejeitado',
              className: 'bg-red-100 text-red-800 hover:bg-red-100/80',
            },
            expired: {
              label: 'Expirado',
              className: 'bg-orange-100 text-orange-800 hover:bg-orange-100/80',
            },
          };
          const config = statusConfig[status] || { label: status, className: '' };
          return (
            <Badge variant="secondary" className={config.className}>
              {config.label}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'validUntil',
        header: 'Data de Validade',
        cell: ({ row }) => {
          const validUntil = row.getValue('validUntil') as string | null;
          return validUntil
            ? new Date(validUntil).toLocaleDateString('pt-BR')
            : '-';
        },
      },
      {
        accessorKey: 'totalAmount',
        header: 'Valor Total',
        cell: ({ row }) => {
          const amount = row.getValue('totalAmount') as number;
          return (
            <span className="font-semibold text-success">
              {formatCurrency(amount)}
            </span>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const quotation = row.original;

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
                    router.push(`/dashboard/quotations/${quotation.id}`);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/quotations/${quotation.id}/edit`);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialog({ isOpen: true, id: quotation.id });
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

    return data.filter((quotation) =>
      quotation.number.toLowerCase().includes(globalFilter.toLowerCase()) ||
      quotation.customer?.name.toLowerCase().includes(globalFilter.toLowerCase())
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
    <div className="space-y-4 sm:space-y-6 animate-fadeInUp max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie seus orçamentos e propostas
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/quotations/new')}
          className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
        >
          <Plus className="w-5 h-5" />
          Novo Orçamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total de Orçamentos</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
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
              <p className="text-xs sm:text-sm text-muted-foreground">Aprovados</p>
              <p className="text-xl sm:text-2xl font-bold text-success mt-1">{stats.approved}</p>
            </div>
            <div className="p-2 sm:p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Valor Total</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">
                {formatCurrency(stats.totalValue)}
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar orçamentos por número ou cliente..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10 h-11 text-base sm:text-sm"
          />
        </div>
        <Button variant="outline" disabled className="min-h-[44px]">
          Filtros Avançados
        </Button>
      </div>

      {/* Data Table or Empty State */}
      {filteredData.length === 0 && !loading ? (
        <div className="bg-card rounded-lg shadow border border-border p-6 sm:p-12 text-center">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            {data.length === 0 ? 'Nenhum orçamento encontrado' : 'Nenhum resultado encontrado'}
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            {data.length === 0
              ? 'Comece criando seu primeiro orçamento'
              : 'Tente ajustar os filtros de busca'}
          </p>
          {data.length === 0 && (
            <Button
              onClick={() => router.push('/dashboard/quotations/new')}
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Primeiro Orçamento
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow border border-border p-6">
          <DataTable
            columns={columns}
            data={filteredData}
            onRowClick={(row) => router.push(`/dashboard/quotations/${row.id}`)}
          />
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Excluir Orçamento Permanentemente"
        message="⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL e o orçamento será excluído permanentemente do banco de dados. Só é possível excluir orçamentos que não possuem ordens de serviço associadas."
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
