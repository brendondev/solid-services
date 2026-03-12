'use client';

import { useEffect, useState } from 'react';
import { dashboardApi, DashboardStats, QuickStats } from '@/lib/api/dashboard';

export default function DashboardMainPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashboardData, quickData] = await Promise.all([
        dashboardApi.getOperationalDashboard(),
        dashboardApi.getQuickStats(),
      ]);
      setStats(dashboardData);
      setQuickStats(quickData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!stats || !quickStats) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Resumo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clientes Ativos</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.summary.customersCount}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Serviços Cadastrados</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.summary.servicesCount}
              </p>
            </div>
            <div className="text-4xl">🔧</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ordens Ativas</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.summary.activeOrdersCount}
              </p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">A Receber</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.summary.pendingReceivablesAmount)}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Estatísticas Hoje/Semana/Mês */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoje</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Ordens Agendadas</span>
              <span className="font-semibold">
                {quickStats.today.scheduledOrders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Ordens Concluídas</span>
              <span className="font-semibold">
                {quickStats.today.completedOrders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pagamentos</span>
              <span className="font-semibold">
                {quickStats.today.paymentsReceived}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium text-gray-900">Total</span>
              <span className="font-bold text-green-600">
                {formatCurrency(quickStats.today.paymentsAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Esta Semana</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Novos Clientes</span>
              <span className="font-semibold">
                {quickStats.thisWeek.newCustomers}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Orçamentos Enviados</span>
              <span className="font-semibold">
                {quickStats.thisWeek.quotationsSent}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Serviços Completos</span>
              <span className="font-semibold">
                {quickStats.thisWeek.ordersCompleted}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium text-gray-900">Receita</span>
              <span className="font-bold text-green-600">
                {formatCurrency(quickStats.thisWeek.revenue)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Este Mês</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total de Ordens</span>
              <span className="font-semibold">
                {quickStats.thisMonth.totalOrders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Ordens Concluídas</span>
              <span className="font-semibold">
                {quickStats.thisMonth.completedOrders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Receita Total</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(quickStats.thisMonth.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium text-gray-900">Pendente</span>
              <span className="font-bold text-orange-600">
                {formatCurrency(quickStats.thisMonth.pendingReceivables)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status de Orçamentos e Ordens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Orçamentos
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Rascunho</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {stats.quotations.draft}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Enviados</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {stats.quotations.sent}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Aprovados</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {stats.quotations.approved}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Rejeitados</span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                {stats.quotations.rejected}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ordens de Serviço
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Abertas</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {stats.orders.open}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Agendadas</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {stats.orders.scheduled}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Em Andamento</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                {stats.orders.in_progress}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Concluídas</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {stats.orders.completed}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ordens Recentes e Próximas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ordens Recentes
          </h3>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma ordem recente</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-2 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.number}
                    </p>
                    <p className="text-xs text-gray-500">{order.customerName}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Próximos Agendamentos
          </h3>
          {stats.upcomingOrders.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum agendamento próximo</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-2 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.number}
                    </p>
                    <p className="text-xs text-gray-500">{order.customerName}</p>
                    {order.assignedToName && (
                      <p className="text-xs text-blue-600">
                        👤 {order.assignedToName}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-600">
                    {new Date(order.scheduledFor).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
