import api from './client';

export interface DashboardStats {
  summary: {
    activeCustomers: number;
    activeServices: number;
    ordersThisMonth: number;
    pendingReceivables: number;
    pendingAmount: number;
  };
  quotations: {
    draft: number;
    sent: number;
    approved: number;
    rejected: number;
    total: number;
  };
  orders: {
    open: number;
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    total: number;
  };
  recentOrders: Array<{
    id: string;
    number: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    customer: {
      id: string;
      name: string;
    };
  }>;
  upcomingOrders: Array<{
    id: string;
    number: string;
    status: string;
    scheduledFor: string;
    customer: {
      id: string;
      name: string;
    };
    assignedUser: {
      id: string;
      name: string;
    } | null;
  }>;
}

export interface QuickStats {
  pendingQuotations: number;
  activeOrders: number;
  overdueReceivables: number;
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

export interface RevenueHistory {
  month: number;
  year: number;
  label: string;
  received: number;
  total: number;
}

export interface OrdersHistory {
  month: number;
  year: number;
  label: string;
  created: number;
  completed: number;
  cancelled: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  totalRevenue: number;
  ordersCount: number;
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

  getRevenueHistory: async (months: number = 6): Promise<RevenueHistory[]> => {
    const response = await api.get(`/dashboard/revenue-history?months=${months}`);
    return response.data;
  },

  getOrdersHistory: async (months: number = 6): Promise<OrdersHistory[]> => {
    const response = await api.get(`/dashboard/orders-history?months=${months}`);
    return response.data;
  },

  getTopCustomers: async (limit: number = 5): Promise<TopCustomer[]> => {
    const response = await api.get(`/dashboard/top-customers?limit=${limit}`);
    return response.data;
  },
};
