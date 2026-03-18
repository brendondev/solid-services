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

// ============================================================================
// PAYABLES (Contas a Pagar)
// ============================================================================

export interface Payable {
  id: string;
  tenantId: string;
  supplierId: string | null;
  description: string;
  amount: number;
  paidAmount: number;
  status: string;
  dueDate: string;
  paidAt: string | null;
  category: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  supplier?: {
    id: string;
    name: string;
  };
  payments?: PayablePayment[];
  _count?: {
    payments: number;
  };
}

export interface PayablePayment {
  id: string;
  payableId: string;
  amount: number;
  method: string;
  paidAt: string;
  registeredBy: string;
  notes: string | null;
  createdAt: string;
  registeredUser?: {
    id: string;
    name: string;
  };
}

export interface CreatePayableDto {
  supplierId?: string;
  description: string;
  amount: number;
  dueDate: string;
  category?: 'rent' | 'utilities' | 'supplies' | 'salary' | 'tax' | 'service' | 'other';
  notes?: string;
}

export interface UpdatePayableDto {
  supplierId?: string;
  description?: string;
  amount?: number;
  dueDate?: string;
  category?: string;
  notes?: string;
}

export interface CreatePayablePaymentDto {
  amount: number;
  method: 'cash' | 'pix' | 'bank_transfer' | 'debit_card' | 'credit_card' | 'check';
  paidAt?: string;
  notes?: string;
}

// ============================================================================
// RECEIVABLES (Contas a Receber)
// ============================================================================

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
  receivables: {
    pending: number;
    receivedThisMonth: number;
    overdueCount: number;
    upcoming30Days: number;
  };
  payables: {
    pending: number;
    paidThisMonth: number;
    overdueCount: number;
    upcoming30Days: number;
  };
  cashFlow: {
    currentBalance: number;
    projected30Days: number;
    monthlyProfit: number;
  };
  // Manter compatibilidade com código antigo
  summary?: {
    totalReceivables: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
  };
}

export const financialApi = {
  findAllReceivables: async (status?: string): Promise<Receivable[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await api.get(`/financial/receivables?${params.toString()}`);
    return response.data.data || [];
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

  // ============================================================================
  // PAYABLES (Contas a Pagar)
  // ============================================================================

  findAllPayables: async (page: number = 1, limit: number = 10, status?: string, overdue?: boolean): Promise<{ data: Payable[]; meta: any }> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    if (overdue !== undefined) params.append('overdue', overdue.toString());

    const response = await api.get(`/financial/payables?${params.toString()}`);
    return response.data;
  },

  findOnePayable: async (id: string): Promise<Payable> => {
    const response = await api.get(`/financial/payables/${id}`);
    return response.data;
  },

  createPayable: async (data: CreatePayableDto): Promise<Payable> => {
    const response = await api.post('/financial/payables', data);
    return response.data;
  },

  updatePayable: async (id: string, data: UpdatePayableDto): Promise<Payable> => {
    const response = await api.patch(`/financial/payables/${id}`, data);
    return response.data;
  },

  removePayable: async (id: string): Promise<void> => {
    await api.delete(`/financial/payables/${id}`);
  },

  registerPayablePayment: async (payableId: string, data: CreatePayablePaymentDto): Promise<PayablePayment> => {
    const response = await api.post(`/financial/payables/${payableId}/payments`, data);
    return response.data;
  },

  findPayablesBySupplier: async (supplierId: string): Promise<Payable[]> => {
    const response = await api.get(`/financial/payables/supplier/${supplierId}`);
    return response.data;
  },
};
