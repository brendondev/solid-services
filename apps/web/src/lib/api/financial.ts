import api from './client';

export interface Receivable {
  id: string;
  customerId: string;
  serviceOrderId: string | null;
  amount: number;
  paidAmount: number;
  status: string;
  dueDate: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
  };
  serviceOrder?: {
    id: string;
    number: string;
  };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  receivableId: string;
  amount: number;
  method: string;
  paidAt: string;
  registeredBy: string;
  notes: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface CreateReceivableDto {
  customerId: string;
  serviceOrderId?: string;
  amount: number;
  dueDate: string;
  description?: string;
}

export interface UpdateReceivableDto {
  customerId?: string;
  amount?: number;
  dueDate?: string;
  description?: string;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
}

export interface CreatePaymentDto {
  amount: number;
  method: 'cash' | 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'other';
  paidAt?: string;
  notes?: string;
}

export interface FinancialDashboard {
  summary: {
    totalReceivables: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
  };
  byStatus: {
    pending: number;
    paid: number;
    overdue: number;
    cancelled: number;
  };
  upcoming: Array<{
    id: string;
    customerName: string;
    amount: number;
    dueDate: string;
  }>;
  recentPayments: Array<{
    id: string;
    customerName: string;
    amount: number;
    method: string;
    paidAt: string;
  }>;
}

export const financialApi = {
  findAllReceivables: async (status?: string): Promise<Receivable[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await api.get(`/financial/receivables?${params.toString()}`);
    return response.data;
  },

  findOneReceivable: async (id: string): Promise<Receivable> => {
    const response = await api.get(`/financial/receivables/${id}`);
    return response.data;
  },

  createReceivable: async (data: CreateReceivableDto): Promise<Receivable> => {
    const response = await api.post('/financial/receivables', data);
    return response.data;
  },

  updateReceivable: async (
    id: string,
    data: UpdateReceivableDto
  ): Promise<Receivable> => {
    const response = await api.patch(`/financial/receivables/${id}`, data);
    return response.data;
  },

  removeReceivable: async (id: string): Promise<void> => {
    await api.delete(`/financial/receivables/${id}`);
  },

  registerPayment: async (
    receivableId: string,
    data: CreatePaymentDto
  ): Promise<Payment> => {
    const response = await api.post(
      `/financial/receivables/${receivableId}/payments`,
      data
    );
    return response.data;
  },

  getDashboard: async (): Promise<FinancialDashboard> => {
    const response = await api.get('/financial/dashboard');
    return response.data;
  },
};
