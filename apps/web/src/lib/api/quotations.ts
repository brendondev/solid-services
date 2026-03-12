import api from './client';

export interface Quotation {
  id: string;
  number: string;
  customerId: string;
  status: string;
  totalAmount: number;
  validUntil: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
  };
  items?: QuotationItem[];
}

export interface QuotationItem {
  id: string;
  quotationId: string;
  serviceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  order: number;
  service?: {
    id: string;
    name: string;
  };
}

export interface CreateQuotationDto {
  customerId: string;
  validUntil?: string;
  notes?: string;
  items: Array<{
    serviceId: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface UpdateQuotationDto {
  customerId?: string;
  validUntil?: string;
  notes?: string;
  status?: 'draft' | 'sent' | 'approved' | 'rejected';
}

export const quotationsApi = {
  findAll: async (status?: string): Promise<Quotation[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await api.get(`/quotations?${params.toString()}`);
    return response.data;
  },

  findPending: async (): Promise<Quotation[]> => {
    const response = await api.get('/quotations/pending');
    return response.data;
  },

  findByCustomer: async (customerId: string): Promise<Quotation[]> => {
    const response = await api.get(`/quotations/customer/${customerId}`);
    return response.data;
  },

  findOne: async (id: string): Promise<Quotation> => {
    const response = await api.get(`/quotations/${id}`);
    return response.data;
  },

  create: async (data: CreateQuotationDto): Promise<Quotation> => {
    const response = await api.post('/quotations', data);
    return response.data;
  },

  update: async (id: string, data: UpdateQuotationDto): Promise<Quotation> => {
    const response = await api.patch(`/quotations/${id}`, data);
    return response.data;
  },

  updateStatus: async (
    id: string,
    status: 'sent' | 'approved' | 'rejected'
  ): Promise<Quotation> => {
    const response = await api.patch(`/quotations/${id}/status/${status}`);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/quotations/${id}`);
  },
};
