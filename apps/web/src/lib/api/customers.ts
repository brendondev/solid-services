import api from './client';

export interface Customer {
  id: string;
  name: string;
  type: string;
  document: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  contacts?: CustomerContact[];
  addresses?: CustomerAddress[];
}

// Helper para pegar email e phone do contato primário
export const getPrimaryContact = (customer: Customer) => {
  if (!customer.contacts || customer.contacts.length === 0) {
    return { email: null, phone: null };
  }
  const primary = customer.contacts.find(c => c.isPrimary) || customer.contacts[0];
  return {
    email: primary.email,
    phone: primary.phone
  };
};

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
  type: 'individual' | 'company';
  document?: string;
  notes?: string;
  contacts?: Array<{
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    isPrimary?: boolean;
  }>;
  addresses?: Array<{
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
    isPrimary?: boolean;
  }>;
}

export interface UpdateCustomerDto {
  name?: string;
  type?: 'individual' | 'company';
  document?: string;
  status?: 'active' | 'inactive';
  notes?: string;
}

export const customersApi = {
  findAll: async (status?: string): Promise<Customer[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await api.get(`/customers?${params.toString()}`);
    return response.data.data || [];
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

  generatePortalToken: async (id: string): Promise<{ token: string; portalUrl: string; expiresIn: string }> => {
    const response = await api.post(`/portal/generate-token/${id}`);
    return response.data;
  },
};
