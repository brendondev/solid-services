import api from './client';

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  contacts?: CustomerContact[];
  addresses?: CustomerAddress[];
}

export interface CustomerContact {
  id: string;
  customerId: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  isPrimary: boolean;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isPrimary: boolean;
}

export interface CreateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  type: 'individual' | 'company';
  contacts?: Array<{
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    isPrimary: boolean;
  }>;
  addresses?: Array<{
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    isPrimary: boolean;
  }>;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  type?: 'individual' | 'company';
  status?: 'active' | 'inactive';
}

export const customersApi = {
  findAll: async (status?: string): Promise<Customer[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await api.get(`/customers?${params.toString()}`);
    return response.data;
  },

  findActive: async (): Promise<Customer[]> => {
    const response = await api.get('/customers/active');
    return response.data;
  },

  findOne: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data: CreateCustomerDto): Promise<Customer> => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};
