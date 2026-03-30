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
  district: string;
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

  toggleStatus: async (id: string): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}/toggle-status`);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },

  // Portal do Cliente - Gerenciamento de Tokens
  generatePortalToken: async (id: string): Promise<{
    token: string;
    portalUrl: string;
    message: string;
  }> => {
    const response = await api.post(`/portal/management/generate-token/${id}`);
    return response.data;
  },

  getTokenStatus: async (id: string): Promise<{
    hasToken: boolean;
    token?: string;
    portalUrl?: string;
    isValidated?: boolean;
    validatedAt?: string;
    generatedAt?: string;
    lastUsedAt?: string;
    status?: string;
    message?: string;
  }> => {
    const response = await api.get(`/portal/management/token-status/${id}`);
    return response.data;
  },

  revokePortalToken: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/portal/management/revoke-token/${id}`);
    return response.data;
  },

  // Atualizar contato
  updateContact: async (
    customerId: string,
    contactId: string,
    data: Partial<CustomerContact>
  ): Promise<CustomerContact> => {
    const response = await api.patch(`/customers/${customerId}/contacts/${contactId}`, data);
    return response.data;
  },

  // Atualizar endereço
  updateAddress: async (
    customerId: string,
    addressId: string,
    data: Partial<CustomerAddress>
  ): Promise<CustomerAddress> => {
    const response = await api.patch(`/customers/${customerId}/addresses/${addressId}`, data);
    return response.data;
  },
};
