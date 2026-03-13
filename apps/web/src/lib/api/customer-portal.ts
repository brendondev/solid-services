/**
 * Customer Portal API Client
 *
 * API client para o portal do cliente (autenticação via token)
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Tipos
export interface CustomerData {
  id: string;
  tenantId: string;
  name: string;
  status: string;
}

export interface QuotationItem {
  id: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  service: {
    name: string;
  };
}

export interface Quotation {
  id: string;
  number: string;
  status: string;
  totalAmount: number;
  validUntil: string;
  notes?: string;
  createdAt: string;
  items: QuotationItem[];
}

export interface OrderItem {
  id: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderTimeline {
  id: string;
  event: string;
  description?: string;
  createdAt: string;
}

export interface ServiceOrder {
  id: string;
  number: string;
  status: string;
  totalAmount: number;
  scheduledFor?: string;
  completedAt?: string;
  createdAt: string;
  items: OrderItem[];
  timeline: OrderTimeline[];
}

// API Client com token
class CustomerPortalApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('customer_portal_token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('customer_portal_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customer_portal_token');
    }
  }

  private getHeaders() {
    const token = this.getToken();
    return {
      'X-Customer-Token': token || '',
    };
  }

  async validateToken(): Promise<CustomerData> {
    const response = await axios.get(`${API_URL}/portal/auth/validate`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getQuotations(): Promise<Quotation[]> {
    const response = await axios.get(`${API_URL}/portal/quotations`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getQuotation(id: string): Promise<Quotation> {
    const response = await axios.get(`${API_URL}/portal/quotations/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async approveQuotation(id: string): Promise<Quotation> {
    const response = await axios.patch(
      `${API_URL}/portal/quotations/${id}/approve`,
      {},
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async rejectQuotation(id: string): Promise<Quotation> {
    const response = await axios.patch(
      `${API_URL}/portal/quotations/${id}/reject`,
      {},
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getOrders(): Promise<ServiceOrder[]> {
    const response = await axios.get(`${API_URL}/portal/orders`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getOrder(id: string): Promise<ServiceOrder> {
    const response = await axios.get(`${API_URL}/portal/orders/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getServiceHistory(): Promise<ServiceOrder[]> {
    const response = await axios.get(`${API_URL}/portal/history`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }
}

export const customerPortalApi = new CustomerPortalApiClient();
