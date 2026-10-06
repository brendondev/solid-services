'use client';
import { MetricStrip } from '@/components/layout/metric-strip';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

const AUTO_REFRESH_ENABLED_KEY = 'dashboard:auto-refresh';
const AUTO_REFRESH_INTERVAL_KEY = 'dashboard:auto-refresh-interval';

const REFRESH_OPTIONS = [
  { label: '30 segundos', value: 30_000 },
  { label: '1 minuto', value: 60_000 },
  { label: '5 minutos', value: 300_000 },
  { label: '15 minutos', value: 900_000 },
];

const DEFAULT_REFRESH_INTERVAL = 300_000; // 5 min

export default function DashboardMainPage() {
  // Desligado por padrão: atualizar sozinho é comportamento que o usuário escolhe.
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(DEFAULT_REFRESH_INTERVAL);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
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

  // Carga inicial. O refresh automático é opt-in — antes o dashboard recarregava
  // sozinho a cada 30s, disparando 6 chamadas de API por ciclo sem o usuário pedir.
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Lê a preferência salva. Em useEffect (e não no initializer do useState) para
  // não divergir do HTML renderizado no servidor e quebrar a hidratação.
  useEffect(() => {
    try {
      const savedEnabled = localStorage.getItem(AUTO_REFRESH_ENABLED_KEY);
      const savedInterval = Number(localStorage.getItem(AUTO_REFRESH_INTERVAL_KEY));
      if (savedEnabled === 'true') setAutoRefresh(true);
      if (REFRESH_OPTIONS.some(o => o.value === savedInterval)) setRefreshInterval(savedInterval);
    } catch {
      // localStorage indisponível (modo privado, storage cheio): segue no padrão
    }
    setPrefsLoaded(true);
  }, []);

  // Persiste só depois de ler — senão o valor padrão sobrescreveria a preferência.
  useEffect(() => {
    if (!prefsLoaded) return;
    try {
      localStorage.setItem(AUTO_REFRESH_ENABLED_KEY, String(autoRefresh));
      localStorage.setItem(AUTO_REFRESH_INTERVAL_KEY, String(refreshInterval));
    } catch { /* idem */ }
  }, [autoRefresh, refreshInterval, prefsLoaded]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadDashboard, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadDashboard]);

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

  // --- Séries históricas para sparkline e variação ------------------------
  // Só existe comparativo onde a API devolve histórico. Clientes e serviços
  // não têm série, então esses tiles ficam sem selo — melhor nada do que um
  // "0%" que o usuário leria como "não mudou".
  const ordersSeries = (ordersHistory || []).map(h => Number(h.created) || 0);
  const revenueSeries = (revenueHistory || []).map(h => Number(h.total) || 0);

  /** Variação percentual do último ponto em relação ao anterior. */
  const pctChange = (series: number[]): number | undefined => {
    if (series.length < 2) return undefined;
    const previous = series[series.length - 2];
    const current = series[series.length - 1];
    if (previous === 0) return current === 0 ? 0 : undefined; // sem base de comparação
    return ((current - previous) / previous) * 100;
  };

  const ordersDelta = pctChange(ordersSeries);
  const revenueDelta = pctChange(revenueSeries);

  // Dados para gráfico de donut (Status de Ordens)
  const ordersChartData = [
    { name: 'Abertas', value: safeStats.orders.open, color: 'hsl(var(--muted-foreground))' },
    { name: 'Agendadas', value: safeStats.orders.scheduled, color: 'hsl(var(--chart-1))' },
    { name: 'Em Andamento', value: safeStats.orders.in_progress, color: 'hsl(var(--chart-3))' },
    { name: 'Concluídas', value: safeStats.orders.completed, color: 'hsl(var(--chart-2))' },
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
        fill="hsl(var(--primary-foreground))"
        // O ponto (x, y) já é o meio da faixa do anel: centrar o texto nele.
        // Com 'start'/'end' o rótulo escapava para fora da faixa e a parte que
        // caía sobre o furo escuro da rosca ficava ilegível ("100%" virava "0%").
        textAnchor="middle"
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Visão geral do seu negócio</p>
        </div>
        <div className="flex flex-col items-start gap-1.5 text-xs text-muted-foreground sm:items-end sm:text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              Atualizado: {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={loadDashboard}
              disabled={loading}
              className="rounded-lg p-1 transition-colors hover:bg-muted disabled:opacity-50"
              title="Atualizar agora"
            >
              <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Atualização automática: opt-in, com intervalo escolhido pelo usuário */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={autoRefresh}
              onClick={() => setAutoRefresh(v => !v)}
              className="group inline-flex items-center gap-2 rounded-md px-1 py-0.5 text-xs transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                aria-hidden="true"
                className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${autoRefresh ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 600, damping: 32 }}
                  className={`inline-block h-3 w-3 rounded-full bg-background shadow-sm ${autoRefresh ? 'ml-3.5' : 'ml-0.5'}`}
                />
              </span>
              Atualizar automaticamente
            </button>

            <label className="sr-only" htmlFor="auto-refresh-interval">Intervalo de atualização</label>
            <select
              id="auto-refresh-interval"
              value={refreshInterval}
              disabled={!autoRefresh}
              onChange={e => setRefreshInterval(Number(e.target.value))}
              className="rounded-md border border-border bg-card px-1.5 py-0.5 text-xs text-foreground transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
            >
              {REFRESH_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumo Principal */}
      <MetricStrip items={[
        { label: <>Clientes Ativos</>, value: <>{safeStats.summary.activeCustomers}</>, tone: 'neutral' },
        { label: <>Serviços Cadastrados</>, value: <>{safeStats.summary.activeServices}</>, tone: 'neutral' },
        {
          label: <>Ordens do Mês</>,
          value: <>{safeStats.summary.ordersThisMonth}</>,
          tone: 'neutral',
          delta: ordersDelta,
          spark: ordersSeries,
        },
        {
          label: <>A Receber</>,
          value: <>{formatCurrency(safeStats.summary.pendingAmount)}</>,
          tone: 'success',
          delta: revenueDelta,
          deltaLabel: 'faturamento vs. mês anterior',
          spark: revenueSeries,
        },
      ]} />

      {/* Métricas Rápidas — cards clicáveis, com entrada escalonada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          {
            title: 'Orçamentos Pendentes',
            caption: 'Aguardando resposta',
            value: safeQuickStats.pendingQuotations,
            icon: FileText,
            tone: 'warning' as const,
            href: '/dashboard/quotations',
          },
          {
            title: 'Ordens Ativas',
            caption: 'Em andamento',
            value: safeQuickStats.activeOrders,
            icon: Clock,
            tone: 'primary' as const,
            href: '/dashboard/orders',
          },
          {
            title: 'Pagamentos Atrasados',
            caption: 'Vencidos',
            value: safeQuickStats.overdueReceivables,
            icon: XCircle,
            tone: 'destructive' as const,
            href: '/dashboard/financial',
          },
        ].map((card, index) => {
          const Icon = card.icon;
          const toneText = { warning: 'text-warning', primary: 'text-primary', destructive: 'text-destructive' }[card.tone];
          const toneBg = { warning: 'bg-warning/10', primary: 'bg-primary/10', destructive: 'bg-destructive/10' }[card.tone];
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.08 + index * 0.07 }}
            >
              <Link
                href={card.href}
                className="group block rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${toneBg}`}>
                    <Icon className={`h-5 w-5 ${toneText}`} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground sm:text-lg">{card.title}</h3>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground sm:text-sm">{card.caption}</span>
                  <span className={`text-2xl font-semibold tracking-tight tabular-nums ${toneText}`}>
                    {card.value}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Gráficos Visuais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de Donut - Status de Ordens */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Distribuição de Ordens
            </h3>
          </div>
          {ordersChartData.length > 0 ? (
            <div className="h-48 sm:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie isAnimationActive={false}
                    data={ordersChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius="80%"
                    innerRadius="50%"
                    fill="hsl(var(--chart-4))"
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
            <div className="h-48 sm:h-64 lg:h-80 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Nenhuma ordem registrada</p>
            </div>
          )}
        </div>

        {/* Gráfico de Barras - Top Serviços */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Top 5 Serviços do Mês
            </h3>
          </div>
          {topServicesData.length > 0 ? (
            <div className="h-48 sm:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={topServicesData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => value.toString()}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
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
                  <Bar isAnimationActive={false} dataKey="ordens" fill="hsl(var(--chart-1))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 sm:h-64 lg:h-80 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Nenhum serviço registrado este mês</p>
            </div>
          )}
        </div>
      </div>

      {/* Histórico de Receita e Ordens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de Linha - Evolução de Receita */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Evolução de Receita (6 meses)
            </h3>
          </div>
          {revenueHistory.length > 0 ? (
            <div className="h-48 sm:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={revenueHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
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
                  <Line isAnimationActive={false}
                    type="monotone"
                    dataKey="received"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="Recebido"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line isAnimationActive={false}
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name="Total"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 sm:h-64 lg:h-80 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Nenhum dado de receita disponível</p>
            </div>
          )}
        </div>

        {/* Gráfico de Linha - Evolução de Ordens */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Evolução de Ordens (6 meses)
            </h3>
          </div>
          {ordersHistory.length > 0 ? (
            <div className="h-48 sm:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={ordersHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
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
                  <Line isAnimationActive={false}
                    type="monotone"
                    dataKey="created"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line isAnimationActive={false}
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line isAnimationActive={false}
                    type="monotone"
                    dataKey="cancelled"
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 sm:h-64 lg:h-80 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Nenhum dado de ordens disponível</p>
            </div>
          )}
        </div>
      </div>

      {/* Top 5 Clientes */}
      <div className="bg-card p-4 rounded-lg border border-border">
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
      <div className="   p-4 sm:p-6 rounded-lg border-2 border-primary/20">
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
        <div className="bg-card p-4 rounded-lg border border-border">
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
              <span className="px-3 py-1 bg-info/10 text-info  border border-info/20 rounded-full text-sm font-medium">
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

        <div className="bg-card p-4 rounded-lg border border-border">
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
              <span className="px-3 py-1 bg-info/10 text-info  border border-info/20 rounded-full text-sm font-medium">
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
        <div className="bg-card p-4 rounded-lg border border-border">
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
                        : 'bg-info-subtle text-info border-info/30'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card p-4 rounded-lg border border-border">
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
