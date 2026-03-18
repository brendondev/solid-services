'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { financialApi, Payable } from '@/lib/api/financial';
import { showToast } from '@/lib/toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  Plus,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Eye,
  Trash2,
  Loader2,
  Building2,
  FileText,
} from 'lucide-react';

export default function PayablesPage() {
  const router = useRouter();
  const [payables, setPayables] = useState<Payable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadPayables();
  }, [filter]);

  const loadPayables = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await financialApi.findAllPayables(1, 50, filter || undefined);
      setPayables(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar contas a pagar');
      setPayables([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reason?: string) => {
    if (!deleteDialog.id) return;

    try {
      setIsDeleting(true);
      await financialApi.removePayable(deleteDialog.id);
      showToast.success('Conta a pagar excluída com sucesso');
      setDeleteDialog({ isOpen: false, id: null });
      await loadPayables();
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Erro ao excluir conta a pagar');
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

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: {
      label: 'Pendente',
      color: 'bg-warning/10 text-warning border-warning/20',
      icon: Clock,
    },
    partial: {
      label: 'Parcial',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: AlertCircle,
    },
    paid: {
      label: 'Pago',
      color: 'bg-success/10 text-success border-success/20',
      icon: CheckCircle,
    },
  };

  const categoryLabels: Record<string, string> = {
    rent: 'Aluguel',
    utilities: 'Utilidades',
    supplies: 'Suprimentos',
    salary: 'Salário',
    tax: 'Impostos',
    service: 'Serviços',
    other: 'Outros',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
        <button
          onClick={() => router.push('/dashboard/payables/new')}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nova Conta a Pagar
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow border border-border">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white min-w-[200px]"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="partial">Parcial</option>
            <option value="paid">Pago</option>
          </select>
        </div>
      </div>

      {/* Payables List */}
      {payables.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-border p-12 text-center">
          <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900 mb-2">Nenhuma conta a pagar encontrada</p>
          <p className="text-muted-foreground mb-6">Registre uma nova despesa</p>
          <button
            onClick={() => router.push('/dashboard/payables/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Adicionar Primeira Conta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {payables.map((payable) => {
            const statusInfo = statusConfig[payable.status];
            const StatusIcon = statusInfo?.icon || Clock;
            const remaining = Number(payable.amount) - Number(payable.paidAmount);

            return (
              <div
                key={payable.id}
                className="bg-white rounded-lg shadow border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-destructive/10 rounded-lg">
                        <DollarSign className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{payable.description}</h3>
                        {payable.supplier && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/suppliers/${payable.supplierId}`);
                              }}
                              className="text-primary hover:text-primary/80 hover:underline transition-colors"
                            >
                              {payable.supplier.name}
                            </button>
                          </div>
                        )}
                        {payable.category && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="w-4 h-4" />
                            <span>{categoryLabels[payable.category] || payable.category}</span>
                          </div>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusInfo?.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo?.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Total</p>
                        <p className="text-base font-bold text-gray-900">
                          {formatCurrency(Number(payable.amount))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Pago</p>
                        <p className="text-base font-bold text-success">
                          {formatCurrency(Number(payable.paidAmount))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">A Pagar</p>
                        <p className="text-base font-bold text-destructive">
                          {formatCurrency(remaining)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Vencimento</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <p className="text-base font-medium text-gray-900">
                            {new Date(payable.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => router.push(`/dashboard/payables/${payable.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, id: payable.id })}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Excluir Conta a Pagar"
        message="Tem certeza que deseja excluir esta conta a pagar?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        requireReason={true}
        reasonLabel="Motivo da exclusão"
        reasonPlaceholder="Informe o motivo para fins de auditoria..."
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
}
