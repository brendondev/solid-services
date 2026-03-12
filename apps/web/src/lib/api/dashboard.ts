import api from './client';

export interface DashboardStats {
  summary: {
    customersCount: number;
    servicesCount: number;
    activeOrdersCount: number;
    pendingReceivablesAmount: number;
  };
  quotations: {
    draft: number;
    sent: number;
    approved: number;
    rejected: number;
  };
  orders: {
    open: number;
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  recentOrders: Array<{
    id: string;
    number: string;
    customerName: string;
    status: string;
    scheduledFor: string | null;
    createdAt: string;
  }>;
  upcomingOrders: Array<{
    id: string;
    number: string;
    customerName: string;
    scheduledFor: string;
    assignedToName: string | null;
  }>;
}

export interface QuickStats {
  today: {
    scheduledOrders: number;
    completedOrders: number;
    paymentsReceived: number;
    paymentsAmount: number;
  };
  thisWeek: {
    newCustomers: number;
    quotationsSent: number;
    ordersCompleted: number;
    revenue: number;
  };
  thisMonth: {
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    pendingReceivables: number;
  };
}

export interface MonthlyPerformance {
  month: string;
  year: number;
  orders: {
    total: number;
    completed: number;
    completionRate: number;
  };
  revenue: {
    total: number;
    received: number;
    pending: number;
  };
  customers: {
    new: number;
    active: number;
  };
  topServices: Array<{
    serviceName: string;
    ordersCount: number;
    revenue: number;
  }>;
}

export const dashboardApi = {
  getOperationalDashboard: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/operational');
    return response.data;
  },

  getQuickStats: async (): Promise<QuickStats> => {
    const response = await api.get('/dashboard/quick-stats');
    return response.data;
  },

  getMonthlyPerformance: async (
    month?: number,
    year?: number
  ): Promise<MonthlyPerformance> => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());

    const response = await api.get(
      `/dashboard/monthly-performance?${params.toString()}`
    );
    return response.data;
  },
};
