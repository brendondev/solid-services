/**
 * Tipos para Portal do Cliente
 */

export interface CustomerData {
  id: string;
  tenantId: string;
  name: string;
  status: string;
}

export interface QuotationItem {
  id: string;
  serviceId: string;
  service: {
    name: string;
  };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  description?: string;
}

export interface Quotation {
  id: string;
  number: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  totalAmount: number;
  discount: number;
  observations?: string;
  validUntil: string;
  createdAt: string;
  items: QuotationItem[];
  // Assinatura Digital
  signedAt?: string | null;
  signedBy?: string | null;
  signedDocumentUrl?: string | null;
  signatureHash?: string | null;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  description?: string;
}

export interface OrderTimeline {
  id: string;
  event: string;
  description?: string;
  createdAt: string;
}

export interface OrderChecklist {
  id: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

export interface OrderAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface ServiceOrder {
  id: string;
  number: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledFor?: string;
  completedAt?: string;
  observations?: string;
  items: OrderItem[];
  timeline: OrderTimeline[];
  checklists?: OrderChecklist[];
  attachments?: OrderAttachment[];
  // Assinatura Digital
  signedAt?: string | null;
  signedBy?: string | null;
  signedDocumentUrl?: string | null;
  signatureHash?: string | null;
}

export interface ServiceHistory {
  id: string;
  number: string;
  completedAt: string;
  items: OrderItem[];
}
