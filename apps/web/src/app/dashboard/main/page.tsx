'use client';

import { useEffect, useState } from 'react';
import { dashboardApi, DashboardStats, QuickStats, MonthlyPerformance } from '@/lib/api/dashboard';
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
  Loader2,
  BarChart3
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function DashboardMainPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [monthlyPerf, setMonthlyPerf] = useState<MonthlyPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashboardData, quickData, monthlyData] = await Promise.all([
        dashboardApi.getOperationalDashboard(),
        dashboardApi.getQuickStats(),
        dashboardApi.getMonthlyPerformance(),
      ]);
      setStats(dashboardData);
      setQuickStats(quickData);
      setMonthlyPerf(monthlyData);
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
      <div className="space-y-4 p-4 sm:p-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          <p className="font-semibold">Erro ao carregar dashboard</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={loadDashboard}
          className="min-h-[44px] px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!stats || !quickStats || !monthlyPerf) {
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

  const safeMonthlyPerf = {
    month: monthlyPerf.month || new Date().getMonth() + 1,
    year: monthlyPerf.year || new Date().getFullYear(),
    revenue: monthlyPerf.revenue || { total: 0, received: 0, pending: 0 },
    orders: monthlyPerf.orders || { total: 0, completed: 0, completionRate: 0 },
    customers: monthlyPerf.customers || { new: 0, active: 0, returning: 0 },
    topServices: monthlyPerf.topServices || []
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Dados para gráfico de donut (Status de Ordens)
  const ordersChartData = [
    { name: 'Abertas', value: safeStats.orders.open, color: '#6B7280' },
    { name: 'Agendadas', value: safeStats.orders.scheduled, color: '#3B82F6' },
    { name: 'Em Andamento', value: safeStats.orders.in_progress, color: '#F59E0B' },
    { name: 'Concluídas', value: safeStats.orders.completed, color: '#10B981' },
  ].filter(item => item.value > 0); // Remove itens com valor 0

  // Dados para gráfico de barras (Top Serviços)
  const topServicesData = safeMonthlyPerf.topServices.slice(0, 5).map(service => ({
    name: service.serviceName.length > 20 ? service.serviceName.substring(0, 20) + '...' : service.serviceName,
    ordens: service.ordersCount,
    receita: Number(service.revenue),
  }));

  // Custom label para o Donut chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Não mostra labels muito pequenos
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 animate-fadeInUp">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Resumo Principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Clientes Ativos</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                {safeStats.summary.activeCustomers}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Serviços Cadastrados</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                {safeStats.summary.activeServices}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-accent rounded-lg">
              <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-accent-foreground" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Ordens do Mês</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                {safeStats.summary.ordersThisMonth}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-warning/10 rounded-lg">
              <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">A Receber</p>
              <p className="text-lg sm:text-2xl font-bold text-success mt-1">
                {formatCurrency(safeStats.summary.pendingAmount)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-success/10 rounded-lg">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning/10 rounded-lg">
              <FileText className="w-5 h-5 text-warning" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Orçamentos Pendentes</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Aguardando resposta</span>
            <span className="text-2xl sm:text-3xl font-bold text-warning">
              {safeQuickStats.pendingQuotations}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Ordens Ativas</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Em andamento</span>
            <span className="text-2xl sm:text-3xl font-bold text-primary">
              {safeQuickStats.activeOrders}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Pagamentos Atrasados</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Vencidos</span>
            <span className="text-2xl sm:text-3xl font-bold text-destructive">
              {safeQuickStats.overdueReceivables}
            </span>
          </div>
        </div>
      </div>

      {/* Gráficos Visuais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de Donut - Status de Ordens */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Distribuição de Ordens
            </h3>
          </div>
          {ordersChartData.length > 0 ? (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius="80%"
                    innerRadius="50%"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ordersChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} ordens`, '']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Nenhuma ordem registrada</p>
            </div>
          )}
        </div>

        {/* Gráfico de Barras - Top Serviços */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Top 5 Serviços do Mês
            </h3>
          </div>
          {topServicesData.length > 0 ? (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServicesData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.toString()}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'ordens') return [`${value} ordens`, 'Quantidade'];
                      return [formatCurrency(Number(value ?? 0)), 'Receita'];
                    }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                  <Bar dataKey="ordens" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Nenhum serviço registrado este mês</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Mensal */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 sm:p-6 rounded-lg border-2 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Performance de {safeMonthlyPerf.month}/{safeMonthlyPerf.year}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/50 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">Ordens Concluídas</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
              {safeMonthlyPerf.orders.completed}/{safeMonthlyPerf.orders.total}
            </p>
            <p className="text-xs text-success mt-1">
              {safeMonthlyPerf.orders.completionRate.toFixed(1)}% de taxa de conclusão
            </p>
          </div>
          <div className="bg-white/50 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">Receita Total</p>
            <p className="text-xl sm:text-2xl font-bold text-success mt-1">
              {formatCurrency(safeMonthlyPerf.revenue.total)}
            </p>
          </div>
          <div className="bg-white/50 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">Recebido</p>
            <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
              {formatCurrency(safeMonthlyPerf.revenue.received)}
            </p>
          </div>
          <div className="bg-white/50 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">Novos Clientes</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
              {safeMonthlyPerf.customers.new}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {safeMonthlyPerf.customers.active} ativos
            </p>
          </div>
        </div>
      </div>

      {/* Status de Orçamentos e Ordens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Orçamentos
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors active:bg-muted">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Rascunho
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm font-medium">
                {safeStats.quotations.draft}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors active:bg-muted">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Enviados
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                {safeStats.quotations.sent}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors active:bg-muted">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Aprovados
              </span>
              <span className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-sm font-medium">
                {safeStats.quotations.approved}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors active:bg-muted">
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

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning/10 rounded-lg">
              <ClipboardList className="w-5 h-5 text-warning" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Ordens de Serviço
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors active:bg-muted">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Abertas
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm font-medium">
                {safeStats.orders.open}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors active:bg-muted">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Agendadas
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                {safeStats.orders.scheduled}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors active:bg-muted">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                Em Andamento
              </span>
              <span className="px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-sm font-medium">
                {safeStats.orders.in_progress}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors active:bg-muted">
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
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Ordens Recentes
          </h3>
          {safeStats.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma ordem recente</p>
          ) : (
            <div className="space-y-3">
              {safeStats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 hover:bg-muted/50 p-2 rounded-lg transition-colors active:bg-muted"
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

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Próximos Agendamentos
          </h3>
          {safeStats.upcomingOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum agendamento próximo</p>
          ) : (
            <div className="space-y-3">
              {safeStats.upcomingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 hover:bg-muted/50 p-2 rounded-lg transition-colors active:bg-muted"
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
