import api from './client';

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    payables: number;
  };
}

export interface CreateSupplierDto {
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  document?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  notes?: string;
}

export const suppliersApi = {
  findAll: async (page: number = 1, limit: number = 10, status?: string): Promise<{ data: Supplier[]; meta: any }> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await api.get(`/suppliers?${params.toString()}`);
    return response.data;
  },

  findActive: async (): Promise<Supplier[]> => {
    const response = await api.get('/suppliers/active');
    return response.data;
  },

  findOne: async (id: string): Promise<Supplier> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (data: CreateSupplierDto): Promise<Supplier> => {
    const response = await api.post('/suppliers', data);
    return response.data;
  },

  update: async (id: string, data: UpdateSupplierDto): Promise<Supplier> => {
    const response = await api.patch(`/suppliers/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },
};
