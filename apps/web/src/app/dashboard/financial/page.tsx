'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { financialApi, Receivable, FinancialDashboard } from '@/lib/api/financial';
import { PaymentModal } from '@/components/financial/PaymentModal';

export default function FinancialPage() {
  const router = useRouter();
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [dashboard, setDashboard] = useState<FinancialDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('');
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este recebível?')) {
      return;
    }

    try {
      await financialApi.removeReceivable(id);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir recebível');
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
    await loadData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Vencido',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando dados financeiros...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600">Contas a receber e pagamentos</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/financial/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Novo Recebível
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Dashboard Financeiro */}
      {dashboard && dashboard.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total a Receber</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(dashboard.summary.totalReceivables || 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Recebido</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(dashboard.summary.paidAmount || 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Pendente</p>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(dashboard.summary.pendingAmount || 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Vencido</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(dashboard.summary.overdueAmount || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Tabela de Recebíveis */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="overdue">Vencido</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold">{receivables.length}</span>{' '}
              recebíveis
            </div>
          </div>
        </div>

        {receivables.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">Nenhum recebível encontrado</p>
            <p className="text-sm mt-2">Registre um novo recebível</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receivables.map((receivable) => (
                  <tr key={receivable.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {receivable.customer?.name || '-'}
                      </div>
                      {receivable.serviceOrder && (
                        <div className="text-xs text-gray-500">
                          OS: {receivable.serviceOrder.number}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {receivable.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(receivable.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-600">
                        {formatCurrency(receivable.paidAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(receivable.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          receivable.status
                        )}`}
                      >
                        {getStatusLabel(receivable.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {receivable.amount > receivable.paidAmount && (
                        <button
                          onClick={() => handleOpenPaymentModal(receivable)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Pagar
                        </button>
                      )}
                      <button
                        onClick={() =>
                          router.push(`/dashboard/financial/${receivable.id}`)
                        }
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleDelete(receivable.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        receivable={selectedReceivable}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
