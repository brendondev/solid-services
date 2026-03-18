'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { financialApi, Receivable, FinancialDashboard } from '@/lib/api/financial';
import { PaymentModal } from '@/components/financial/PaymentModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Eye,
  Trash2,
  Loader2,
  CreditCard,
  AlertCircle
} from 'lucide-react';

export default function FinancialPage() {
  const router = useRouter();
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [dashboard, setDashboard] = useState<FinancialDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('');
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    receivableId: string | null;
  }>({ isOpen: false, receivableId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [receivablesData, dashboardData] = await Promise.all([
        filter
          ? financialApi.findAllReceivables(filter)
          : financialApi.findAllReceivables(),
        financialApi.getDashboard(),
      ]);
      setReceivables(Array.isArray(receivablesData) ? receivablesData : []);
      setDashboard(dashboardData || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar dados financeiros');
      setReceivables([]);
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDialog({ isOpen: true, receivableId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDialog.receivableId) return;

    try {
      setIsDeleting(true);
      await financialApi.removeReceivable(confirmDialog.receivableId);
      setConfirmDialog({ isOpen: false, receivableId: null });
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir recebível');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, receivableId: null });
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
    await loadData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: {
      label: 'Pendente',
      color: 'bg-warning/10 text-warning border-warning/20',
      icon: Clock
    },
    paid: {
      label: 'Pago',
      color: 'bg-success/10 text-success border-success/20',
      icon: CheckCircle
    },
    overdue: {
      label: 'Vencido',
      color: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: AlertCircle
    },
    cancelled: {
      label: 'Cancelado',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: XCircle
    },
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
          <p className="text-muted-foreground mt-1">Visão geral do fluxo de caixa</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/payables')}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <TrendingDown className="w-5 h-5" />
            Ver Contas a Pagar
          </button>
          <button
            onClick={() => router.push('/dashboard/financial/new')}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Novo Recebível
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Dashboard Financeiro - Fluxo de Caixa */}
      {dashboard && dashboard.cashFlow && (
        <>
          {/* Cards de Fluxo de Caixa */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Fluxo de Caixa</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Atual</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      dashboard.cashFlow.currentBalance >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {formatCurrency(dashboard.cashFlow.currentBalance || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Receitas - Despesas
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    dashboard.cashFlow.currentBalance >= 0 ? 'bg-success/10' : 'bg-destructive/10'
                  }`}>
                    <DollarSign className={`w-6 h-6 ${
                      dashboard.cashFlow.currentBalance >= 0 ? 'text-success' : 'text-destructive'
                    }`} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Projeção 30 Dias</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      dashboard.cashFlow.projected30Days >= 0 ? 'text-primary' : 'text-warning'
                    }`}>
                      {formatCurrency(dashboard.cashFlow.projected30Days || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Previsão próximo mês
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    dashboard.cashFlow.projected30Days >= 0 ? 'bg-primary/10' : 'bg-warning/10'
                  }`}>
                    <Calendar className={`w-6 h-6 ${
                      dashboard.cashFlow.projected30Days >= 0 ? 'text-primary' : 'text-warning'
                    }`} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Lucro Mensal</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      dashboard.cashFlow.monthlyProfit >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {formatCurrency(dashboard.cashFlow.monthlyProfit || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recebido - Pago no mês
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    dashboard.cashFlow.monthlyProfit >= 0 ? 'bg-success/10' : 'bg-destructive/10'
                  }`}>
                    {dashboard.cashFlow.monthlyProfit >= 0 ? (
                      <TrendingUp className="w-6 h-6 text-success" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-destructive" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contas a Receber */}
          <div className="bg-white rounded-lg shadow border border-border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Contas a Receber
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">A Receber</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(dashboard.receivables?.pending || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recebido no Mês</p>
                <p className="text-xl font-bold text-success mt-1">
                  {formatCurrency(dashboard.receivables?.receivedThisMonth || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-xl font-bold text-destructive">
                    {formatNumber(dashboard.receivables?.overdueCount || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">conta(s)</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próximos 30 Dias</p>
                <p className="text-xl font-bold text-primary mt-1">
                  {formatCurrency(dashboard.receivables?.upcoming30Days || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Contas a Pagar */}
          <div className="bg-white rounded-lg shadow border border-border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              Contas a Pagar
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">A Pagar</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(dashboard.payables?.pending || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pago no Mês</p>
                <p className="text-xl font-bold text-destructive mt-1">
                  {formatCurrency(dashboard.payables?.paidThisMonth || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-xl font-bold text-destructive">
                    {formatNumber(dashboard.payables?.overdueCount || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">conta(s)</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próximos 30 Dias</p>
                <p className="text-xl font-bold text-warning mt-1">
                  {formatCurrency(dashboard.payables?.upcoming30Days || 0)}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Lista de Contas a Receber */}
      <div className="border-t border-border pt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contas a Receber - Detalhes</h2>

        {/* Filters */}
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
              <option value="paid">Pago</option>
              <option value="overdue">Vencido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receivables List */}
      {receivables.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-border p-12 text-center">
          <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900 mb-2">Nenhum recebível encontrado</p>
          <p className="text-muted-foreground mb-6">Registre um novo recebível</p>
          <button
            onClick={() => router.push('/dashboard/financial/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Adicionar Primeiro Recebível
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {receivables.map((receivable) => {
            const statusInfo = statusConfig[receivable.status];
            const StatusIcon = statusInfo?.icon || Clock;
            const remaining = Number(receivable.amount) - Number(receivable.paidAmount);

            return (
              <div
                key={receivable.id}
                className="bg-white rounded-lg shadow border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {receivable.customer?.name || 'Cliente não informado'}
                        </h3>
                        {receivable.serviceOrder && (
                          <p className="text-sm text-muted-foreground">
                            OS: {receivable.serviceOrder.number}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusInfo?.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo?.label}
                      </span>
                    </div>

                    {receivable.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {receivable.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Total</p>
                        <p className="text-base font-bold text-gray-900">
                          {formatCurrency(Number(receivable.amount))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Pago</p>
                        <p className="text-base font-bold text-success">
                          {formatCurrency(Number(receivable.paidAmount))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">A Receber</p>
                        <p className="text-base font-bold text-warning">
                          {formatCurrency(remaining)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Vencimento</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <p className="text-base font-medium text-gray-900">
                            {new Date(receivable.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => router.push(`/dashboard/financial/receivables/${receivable.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </button>
                    {remaining > 0 && (
                      <button
                        onClick={() => handleOpenPaymentModal(receivable)}
                        className="flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors font-medium"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pagar
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(receivable.id)}
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

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        receivable={selectedReceivable}
        onSuccess={handlePaymentSuccess}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Recebível"
        message="Tem certeza que deseja excluir este recebível? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
