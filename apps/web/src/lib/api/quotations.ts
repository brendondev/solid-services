import api from './client';

export interface Quotation {
  id: string;
  number: string;
  customerId: string;
  status: string;
  totalAmount: number;
  discount?: number;
  validUntil: string | null;
  notes: string | null;
  // Assinatura Digital
  signedAt?: string | null;
  signedBy?: string | null;
  signedDocumentUrl?: string | null;
  signatureHash?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
  };
  items?: QuotationItem[];
  serviceOrder?: {
    id: string;
    number: string;
  };
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
  discount?: number;
  items: Array<{
    serviceId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    order: number;
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
    return response.data.data || [];
  },

  findPending: async (): Promise<Quotation[]> => {
    const response = await api.get('/quotations/pending');
    return response.data.data || [];
  },

  findByCustomer: async (customerId: string): Promise<Quotation[]> => {
    const response = await api.get(`/quotations/customer/${customerId}`);
    return response.data.data || [];
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

  downloadPdf: async (id: string, quotationNumber: string): Promise<void> => {
    const response = await api.get(`/quotations/${id}/pdf`, {
      responseType: 'blob',
    });

    // Criar um link temporário para download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orcamento-${quotationNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
