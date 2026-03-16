'use client';

import { useEffect, useState } from 'react';
import { dashboardApi, DashboardStats, QuickStats } from '@/lib/api/dashboard';
import {
  Users,
  Wrench,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  PlayCircle,
  FileText,
  XCircle,
  UserCircle,
  Loader2
} from 'lucide-react';

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!stats || !quickStats || !quickStats.today || !quickStats.thisWeek || !quickStats.thisMonth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">
          {error ? error : 'Carregando dados do dashboard...'}
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Resumo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Clientes Ativos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.summary.customersCount}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Serviços Cadastrados</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.summary.servicesCount}
              </p>
            </div>
            <div className="p-3 bg-accent rounded-lg">
              <Wrench className="w-8 h-8 text-accent-foreground" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ordens Ativas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.summary.activeOrdersCount}
              </p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <ClipboardList className="w-8 h-8 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">A Receber</p>
              <p className="text-2xl font-bold text-success mt-1">
                {formatCurrency(stats.summary.pendingReceivablesAmount)}
              </p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <DollarSign className="w-8 h-8 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas Hoje/Semana/Mês */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Hoje</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ordens Agendadas</span>
              <span className="font-semibold text-gray-900">
                {quickStats.today.scheduledOrders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ordens Concluídas</span>
              <span className="font-semibold text-gray-900">
                {quickStats.today.completedOrders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pagamentos</span>
              <span className="font-semibold text-gray-900">
                {quickStats.today.paymentsReceived}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 mt-3">
              <span className="text-sm font-medium text-gray-900">Total Recebido</span>
              <span className="font-bold text-success">
                {formatCurrency(quickStats.today.paymentsAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Esta Semana</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Novos Clientes</span>
              <span className="font-semibold text-gray-900">
                {quickStats.thisWeek.newCustomers}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Orçamentos Enviados</span>
              <span className="font-semibold text-gray-900">
                {quickStats.thisWeek.quotationsSent}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Serviços Completos</span>
              <span className="font-semibold text-gray-900">
                {quickStats.thisWeek.ordersCompleted}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 mt-3">
              <span className="text-sm font-medium text-gray-900">Receita</span>
              <span className="font-bold text-success">
                {formatCurrency(quickStats.thisWeek.revenue)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Este Mês</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total de Ordens</span>
              <span className="font-semibold text-gray-900">
                {quickStats.thisMonth.totalOrders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ordens Concluídas</span>
              <span className="font-semibold text-gray-900">
                {quickStats.thisMonth.completedOrders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Receita Total</span>
              <span className="font-semibold text-success">
                {formatCurrency(quickStats.thisMonth.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 mt-3">
              <span className="text-sm font-medium text-gray-900">Pendente</span>
              <span className="font-bold text-warning">
                {formatCurrency(quickStats.thisMonth.pendingReceivables)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status de Orçamentos e Ordens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Orçamentos
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Rascunho
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm font-medium">
                {stats.quotations.draft}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Enviados
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                {stats.quotations.sent}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Aprovados
              </span>
              <span className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-sm font-medium">
                {stats.quotations.approved}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Rejeitados
              </span>
              <span className="px-3 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-full text-sm font-medium">
                {stats.quotations.rejected}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning/10 rounded-lg">
              <ClipboardList className="w-5 h-5 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Ordens de Serviço
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Abertas
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm font-medium">
                {stats.orders.open}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Agendadas
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                {stats.orders.scheduled}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                Em Andamento
              </span>
              <span className="px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-sm font-medium">
                {stats.orders.in_progress}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Concluídas
              </span>
              <span className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-sm font-medium">
                {stats.orders.completed}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ordens Recentes e Próximas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ordens Recentes
          </h3>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma ordem recente</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.number}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.customerName}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full border font-medium ${
                      order.status === 'completed'
                        ? 'bg-success/10 text-success border-success/20'
                        : order.status === 'in_progress'
                        ? 'bg-warning/10 text-warning border-warning/20'
                        : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Próximos Agendamentos
          </h3>
          {stats.upcomingOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum agendamento próximo</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {order.number}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.customerName}</p>
                    {order.assignedToName && (
                      <div className="flex items-center gap-1 mt-1">
                        <UserCircle className="w-3 h-3 text-primary" />
                        <p className="text-xs text-primary">
                          {order.assignedToName}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(order.scheduledFor).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
