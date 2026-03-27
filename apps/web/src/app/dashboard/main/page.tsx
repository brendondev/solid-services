'use client';

import { useEffect, useState, useCallback } from 'react';
import { dashboardApi, DashboardStats, QuickStats, MonthlyPerformance, RevenueHistory, OrdersHistory, TopCustomer } from '@/lib/api/dashboard';
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
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

export default function DashboardMainPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [monthlyPerf, setMonthlyPerf] = useState<MonthlyPerformance | null>(null);
  const [revenueHistory, setRevenueHistory] = useState<RevenueHistory[]>([]);
  const [ordersHistory, setOrdersHistory] = useState<OrdersHistory[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [dashboardData, quickData, monthlyData, revenueData, ordersData, customersData] = await Promise.all([
        dashboardApi.getOperationalDashboard(),
        dashboardApi.getQuickStats(),
        dashboardApi.getMonthlyPerformance(),
        dashboardApi.getRevenueHistory(6),
        dashboardApi.getOrdersHistory(6),
        dashboardApi.getTopCustomers(5),
      ]);
      setStats(dashboardData);
      setQuickStats(quickData);
      setMonthlyPerf(monthlyData);
      setRevenueHistory(revenueData);
      setOrdersHistory(ordersData);
      setTopCustomers(customersData);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000); // 30s
    return () => clearInterval(interval);
  }, [loadDashboard]);

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
    <div className="space-y-4 animate-fadeInUp max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Visão geral do seu negócio</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            Atualizado: {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="p-1 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            title="Atualizar agora"
          >
            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Resumo Principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Clientes Ativos</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                {safeStats.summary.activeCustomers}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Serviços Cadastrados</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                {safeStats.summary.activeServices}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-accent rounded-lg">
              <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-accent-foreground" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Ordens do Mês</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                {safeStats.summary.ordersThisMonth}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-warning/10 rounded-lg">
              <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
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
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning/10 rounded-lg">
              <FileText className="w-5 h-5 text-warning" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Orçamentos Pendentes</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Aguardando resposta</span>
            <span className="text-2xl sm:text-3xl font-bold text-warning">
              {safeQuickStats.pendingQuotations}
            </span>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Ordens Ativas</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Em andamento</span>
            <span className="text-2xl sm:text-3xl font-bold text-primary">
              {safeQuickStats.activeOrders}
            </span>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Pagamentos Atrasados</h3>
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
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
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
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: 'hsl(var(--foreground))',
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
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
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
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: 'hsl(var(--foreground))',
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

      {/* Histórico de Receita e Ordens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de Linha - Evolução de Receita */}
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Evolução de Receita (6 meses)
            </h3>
          </div>
          {revenueHistory.length > 0 ? (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), '']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="received"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Recebido"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Total"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Nenhum dado de receita disponível</p>
            </div>
          )}
        </div>

        {/* Gráfico de Linha - Evolução de Ordens */}
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Evolução de Ordens (6 meses)
            </h3>
          </div>
          {ordersHistory.length > 0 ? (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ordersHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, name) => {
                      const labels: Record<string, string> = {
                        created: 'Criadas',
                        completed: 'Concluídas',
                        cancelled: 'Canceladas',
                      };
                      return [`${value} ordens`, labels[name as string] || name];
                    }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    formatter={(value) => {
                      const labels: Record<string, string> = {
                        created: 'Criadas',
                        completed: 'Concluídas',
                        cancelled: 'Canceladas',
                      };
                      return labels[value] || value;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="created"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cancelled"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Nenhum dado de ordens disponível</p>
            </div>
          )}
        </div>
      </div>

      {/* Top 5 Clientes */}
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">
            Top 5 Clientes do Mês
          </h3>
        </div>
        {topCustomers.length > 0 ? (
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer.ordersCount} {customer.ordersCount === 1 ? 'ordem' : 'ordens'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-success">
                    {formatCurrency(customer.totalRevenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum cliente com receita neste mês
          </p>
        )}
      </div>

      {/* Performance Mensal */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 sm:p-6 rounded-lg border-2 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">
            Performance de {safeMonthlyPerf.month}/{safeMonthlyPerf.year}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card/50 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">Ordens Concluídas</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
              {safeMonthlyPerf.orders.completed}/{safeMonthlyPerf.orders.total}
            </p>
            <p className="text-xs text-success mt-1">
              {safeMonthlyPerf.orders.completionRate.toFixed(1)}% de taxa de conclusão
            </p>
          </div>
          <div className="bg-card/50 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">Receita Total</p>
            <p className="text-xl sm:text-2xl font-bold text-success mt-1">
              {formatCurrency(safeMonthlyPerf.revenue.total)}
            </p>
          </div>
          <div className="bg-card/50 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">Recebido</p>
            <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
              {formatCurrency(safeMonthlyPerf.revenue.received)}
            </p>
          </div>
          <div className="bg-card/50 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">Novos Clientes</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
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
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Orçamentos
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors active:bg-muted">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Rascunho
              </span>
              <span className="px-3 py-1 bg-muted text-muted-foreground border border-border rounded-full text-sm font-medium">
                {safeStats.quotations.draft}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors active:bg-muted">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Enviados
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-sm font-medium">
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

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning/10 rounded-lg">
              <ClipboardList className="w-5 h-5 text-warning" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Ordens de Serviço
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors active:bg-muted">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Abertas
              </span>
              <span className="px-3 py-1 bg-muted text-muted-foreground border border-border rounded-full text-sm font-medium">
                {safeStats.orders.open}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg transition-colors active:bg-muted">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Agendadas
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-sm font-medium">
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
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
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
                    <p className="text-sm font-medium text-foreground">
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

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
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
                    <p className="text-sm font-medium text-foreground">
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
