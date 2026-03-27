import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface Conversation {
  id: string;
  tenantId: string;
  customerId: string;
  status: string;
  title?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
  };
  messages?: ChatMessage[];
  _count?: {
    messages: number;
  };
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'customer' | 'employee';
  content: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  createdAt: string;
}

/**
 * Cliente da API de Chat
 */
class ChatAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Cria nova conversa
   */
  async createConversation(customerId: string, title?: string): Promise<Conversation> {
    const response = await axios.post(
      `${API_URL}/chat/conversations`,
      { customerId, title },
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Lista todas as conversas
   */
  async getConversations(status?: string): Promise<Conversation[]> {
    const response = await axios.get(`${API_URL}/chat/conversations`, {
      headers: this.getAuthHeaders(),
      params: { status },
    });
    return response.data;
  }

  /**
   * Busca conversa por ID
   */
  async getConversation(id: string): Promise<Conversation> {
    const response = await axios.get(`${API_URL}/chat/conversations/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  /**
   * Busca conversas de um cliente
   */
  async getConversationsByCustomer(customerId: string): Promise<Conversation[]> {
    const response = await axios.get(
      `${API_URL}/chat/conversations/customer/${customerId}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Atualiza conversa
   */
  async updateConversation(
    id: string,
    data: { title?: string; status?: string }
  ): Promise<Conversation> {
    const response = await axios.patch(
      `${API_URL}/chat/conversations/${id}`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Envia mensagem
   */
  async sendMessage(
    conversationId: string,
    content: string,
    senderType: 'customer' | 'employee'
  ): Promise<ChatMessage> {
    const response = await axios.post(
      `${API_URL}/chat/messages`,
      { conversationId, content, senderType },
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Marca mensagens como lidas
   */
  async markAsRead(conversationId: string): Promise<void> {
    await axios.post(
      `${API_URL}/chat/conversations/${conversationId}/read`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Conta mensagens não lidas
   */
  async getUnreadCount(): Promise<number> {
    const response = await axios.get(`${API_URL}/chat/unread/count`, {
      headers: this.getAuthHeaders(),
    });
    return response.data.count;
  }

  /**
   * Cria conexão SSE para mensagens em tempo real
   */
  createEventSource(conversationId: string): EventSource {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const url = `${API_URL}/chat/stream?conversationId=${encodeURIComponent(conversationId)}&token=${encodeURIComponent(token)}`;

    const eventSource = new EventSource(url, {
      withCredentials: true,
    });

    return eventSource;
  }
}

export const chatAPI = new ChatAPI();
