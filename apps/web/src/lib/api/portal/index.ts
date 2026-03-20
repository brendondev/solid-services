import portalApi from './client';
import type {
  CustomerData,
  Quotation,
  ServiceOrder,
  ServiceHistory,
} from './types';

/**
 * API do Portal do Cliente
 */

// Validar token e obter dados do cliente
export const validateToken = async (): Promise<CustomerData> => {
  const { data } = await portalApi.get<CustomerData>('/portal/auth/validate');
  return data;
};

// Listar orçamentos do cliente
export const getQuotations = async (): Promise<Quotation[]> => {
  const { data } = await portalApi.get<Quotation[]>('/portal/quotations');
  return data;
};

// Buscar orçamento específico
export const getQuotation = async (id: string): Promise<Quotation> => {
  const { data } = await portalApi.get<Quotation>(`/portal/quotations/${id}`);
  return data;
};

// Aprovar orçamento
export const approveQuotation = async (id: string): Promise<Quotation> => {
  const { data } = await portalApi.patch<Quotation>(
    `/portal/quotations/${id}/approve`
  );
  return data;
};

// Rejeitar orçamento
export const rejectQuotation = async (id: string): Promise<Quotation> => {
  const { data } = await portalApi.patch<Quotation>(
    `/portal/quotations/${id}/reject`
  );
  return data;
};

// Listar ordens de serviço
export const getOrders = async (): Promise<ServiceOrder[]> => {
  const { data } = await portalApi.get<ServiceOrder[]>('/portal/orders');
  return data;
};

// Buscar ordem específica
export const getOrder = async (id: string): Promise<ServiceOrder> => {
  const { data } = await portalApi.get<ServiceOrder>(`/portal/orders/${id}`);
  return data;
};

// Histórico de serviços
export const getServiceHistory = async (): Promise<ServiceHistory[]> => {
  const { data } = await portalApi.get<ServiceHistory[]>('/portal/history');
  return data;
};

// Download PDF de orçamento
export const downloadQuotationPdf = async (id: string): Promise<void> => {
  const response = await portalApi.get(`/portal/quotations/${id}/pdf`, {
    responseType: 'blob',
  });

  // Criar URL temporário para download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `orcamento-${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Download PDF de ordem de serviço
export const downloadOrderPdf = async (id: string): Promise<void> => {
  const response = await portalApi.get(`/portal/orders/${id}/pdf`, {
    responseType: 'blob',
  });

  // Criar URL temporário para download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `ordem-servico-${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Re-export tipos
export type {
  CustomerData,
  Quotation,
  QuotationItem,
  ServiceOrder,
  OrderItem,
  OrderTimeline,
  OrderChecklist,
  OrderAttachment,
  ServiceHistory,
} from './types';
