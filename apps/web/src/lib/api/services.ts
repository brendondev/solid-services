import api from './client';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  defaultPrice: number;
  estimatedDuration: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  category?: string;
  defaultPrice: number;
  estimatedDuration?: number;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  category?: string;
  defaultPrice?: number;
  estimatedDuration?: number;
  status?: 'active' | 'inactive';
}

export const servicesApi = {
  findAll: async (status?: string): Promise<Service[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await api.get(`/services?${params.toString()}`);
    return response.data.data || [];
  },

  findActive: async (): Promise<Service[]> => {
    const response = await api.get('/services/active');
    return response.data.data || [];
  },

  findMostUsed: async (limit: number = 10): Promise<Service[]> => {
    const response = await api.get(`/services/most-used?limit=${limit}`);
    return response.data.data || [];
  },

  findOne: async (id: string): Promise<Service> => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  create: async (data: CreateServiceDto): Promise<Service> => {
    const response = await api.post('/services', data);
    return response.data;
  },

  update: async (id: string, data: UpdateServiceDto): Promise<Service> => {
    const response = await api.patch(`/services/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`);
  },
};
