import api from './client';

export interface ServiceOrder {
  id: string;
  number: string;
  customerId: string;
  quotationId: string | null;
  status: string;
  assignedTo: string | null;
  scheduledFor: string | null;
  completedAt: string | null;
  notes: string | null;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
  };
  assignedToUser?: {
    id: string;
    name: string;
  };
  items?: OrderItem[];
  timeline?: OrderTimelineEvent[];
  checklists?: OrderChecklistItem[];
}

export interface OrderItem {
  id: string;
  serviceOrderId: string;
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

export interface OrderTimelineEvent {
  id: string;
  serviceOrderId: string;
  event: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface OrderChecklistItem {
  id: string;
  serviceOrderId: string;
  description: string;
  isCompleted: boolean;
  completedAt: string | null;
  completedBy: string | null;
  order: number;
}

export interface CreateOrderDto {
  customerId: string;
  quotationId?: string;
  assignedTo?: string;
  scheduledFor?: string;
  notes?: string;
  items: Array<{
    serviceId: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface UpdateOrderDto {
  customerId?: string;
  assignedTo?: string;
  scheduledFor?: string;
  notes?: string;
  status?: 'open' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export const ordersApi = {
  findAll: async (status?: string): Promise<ServiceOrder[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await api.get(`/service-orders?${params.toString()}`);
    return response.data;
  },

  findOne: async (id: string): Promise<ServiceOrder> => {
    const response = await api.get(`/service-orders/${id}`);
    return response.data;
  },

  create: async (data: CreateOrderDto): Promise<ServiceOrder> => {
    const response = await api.post('/service-orders', data);
    return response.data;
  },

  createFromQuotation: async (quotationId: string): Promise<ServiceOrder> => {
    const response = await api.post(
      `/service-orders/from-quotation/${quotationId}`
    );
    return response.data;
  },

  update: async (id: string, data: UpdateOrderDto): Promise<ServiceOrder> => {
    const response = await api.patch(`/service-orders/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/service-orders/${id}`);
  },

  // Timeline
  addTimelineEvent: async (
    id: string,
    event: string,
    description?: string
  ): Promise<OrderTimelineEvent> => {
    const response = await api.post(`/service-orders/${id}/timeline`, {
      event,
      description,
    });
    return response.data;
  },

  // Checklist
  addChecklistItem: async (
    id: string,
    description: string
  ): Promise<OrderChecklistItem> => {
    const response = await api.post(`/service-orders/${id}/checklist`, {
      description,
    });
    return response.data;
  },

  completeChecklistItem: async (
    orderId: string,
    checklistId: string
  ): Promise<OrderChecklistItem> => {
    const response = await api.patch(
      `/service-orders/${orderId}/checklist/${checklistId}/complete`
    );
    return response.data;
  },

  uncompleteChecklistItem: async (
    orderId: string,
    checklistId: string
  ): Promise<OrderChecklistItem> => {
    const response = await api.patch(
      `/service-orders/${orderId}/checklist/${checklistId}/uncomplete`
    );
    return response.data;
  },
};
