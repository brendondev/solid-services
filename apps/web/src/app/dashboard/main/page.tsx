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
      setError('');
      const [dashboardData, quickData] = await Promise.all([
        dashboardApi.getOperationalDashboard(),
        dashboardApi.getQuickStats(),
      ]);
      setStats(dashboardData);
      setQuickStats(quickData);
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err);
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
      <div className="space-y-4 p-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          <p className="font-semibold">Erro ao carregar dashboard</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!stats || !quickStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  // Garantir valores padrão para evitar erros
  const safeStats = {
    summary: stats.summary || { activeCustomers: 0, activeServices: 0, ordersThisMonth: 0, pendingReceivables: 0, pendingAmount: 0 },
    quotations: stats.quotations || { draft: 0, sent: 0, approved: 0, rejected: 0, total: 0 },
    orders: stats.orders || { open: 0, scheduled: 0, in_progress: 0, completed: 0, cancelled: 0, total: 0 },
    recentOrders: stats.recentOrders || [],
    upcomingOrders: stats.upcomingOrders || []
  };

  const safeQuickStats = {
    pendingQuotations: quickStats.pendingQuotations || 0,
    activeOrders: quickStats.activeOrders || 0,
    overdueReceivables: quickStats.overdueReceivables || 0
  };

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
                {safeStats.summary.activeCustomers}
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
                {safeStats.summary.activeServices}
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
              <p className="text-sm text-muted-foreground">Ordens do Mês</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {safeStats.summary.ordersThisMonth}
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
                {formatCurrency(safeStats.summary.pendingAmount)}
              </p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <DollarSign className="w-8 h-8 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning/10 rounded-lg">
              <FileText className="w-5 h-5 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Orçamentos Pendentes</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Aguardando resposta</span>
            <span className="text-3xl font-bold text-warning">
              {safeQuickStats.pendingQuotations}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Ordens Ativas</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Em andamento</span>
            <span className="text-3xl font-bold text-primary">
              {safeQuickStats.activeOrders}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Pagamentos Atrasados</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Vencidos</span>
            <span className="text-3xl font-bold text-destructive">
              {safeQuickStats.overdueReceivables}
            </span>
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
                {safeStats.quotations.draft}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Enviados
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                {safeStats.quotations.sent}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Aprovados
              </span>
              <span className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-sm font-medium">
                {safeStats.quotations.approved}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Rejeitados
              </span>
              <span className="px-3 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-full text-sm font-medium">
                {safeStats.quotations.rejected}
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
                {safeStats.orders.open}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Agendadas
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                {safeStats.orders.scheduled}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                Em Andamento
              </span>
              <span className="px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-sm font-medium">
                {safeStats.orders.in_progress}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Concluídas
              </span>
              <span className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-sm font-medium">
                {safeStats.orders.completed}
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
          {safeStats.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma ordem recente</p>
          ) : (
            <div className="space-y-3">
              {safeStats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.number}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.customer.name}</p>
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
          {safeStats.upcomingOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum agendamento próximo</p>
          ) : (
            <div className="space-y-3">
              {safeStats.upcomingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {order.number}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.customer.name}</p>
                    {order.assignedUser?.name && (
                      <div className="flex items-center gap-1 mt-1">
                        <UserCircle className="w-3 h-3 text-primary" />
                        <p className="text-xs text-primary">
                          {order.assignedUser?.name}
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
