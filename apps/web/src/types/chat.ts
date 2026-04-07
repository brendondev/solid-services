/**
 * Tipos TypeScript para o módulo de Chat
 */

export interface ChatAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'customer' | 'employee';
  content: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  attachments?: ChatAttachment[];
  senderName?: string; // Para exibição
}

export interface Conversation {
  id: string;
  tenantId: string;
  customerId: string;
  status: 'open' | 'closed' | 'archived';
  title: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  unreadCount?: number;
}

export interface CreateConversationDto {
  customerId: string;
  title?: string;
  initialMessage?: string;
}

export interface SendMessageDto {
  conversationId: string;
  content: string;
  senderType: 'customer' | 'employee';
}

export interface UpdateConversationDto {
  status?: 'open' | 'closed' | 'archived';
  title?: string;
}

export interface UnreadCountResponse {
  count: number;
}

export interface ConversationListFilters {
  status?: 'open' | 'closed' | 'archived';
  customerId?: string;
}
