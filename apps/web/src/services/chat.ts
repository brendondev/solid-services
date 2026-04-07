import api from './api';
import {
  Conversation,
  CreateConversationDto,
  SendMessageDto,
  UpdateConversationDto,
  UnreadCountResponse,
  ConversationListFilters,
} from '@/types/chat';

const CHAT_BASE_URL = '/chat';

export const chatApi = {
  /**
   * Criar nova conversa
   */
  createConversation: async (data: CreateConversationDto): Promise<Conversation> => {
    const response = await api.post(`${CHAT_BASE_URL}/conversations`, data);
    return response.data;
  },

  /**
   * Listar todas as conversas (com filtros opcionais)
   */
  getConversations: async (filters?: ConversationListFilters): Promise<Conversation[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.customerId) params.append('customerId', filters.customerId);

    const response = await api.get(`${CHAT_BASE_URL}/conversations?${params.toString()}`);
    return response.data;
  },

  /**
   * Buscar conversa por ID (com todas as mensagens)
   */
  getConversationById: async (id: string): Promise<Conversation> => {
    const response = await api.get(`${CHAT_BASE_URL}/conversations/${id}`);
    return response.data;
  },

  /**
   * Buscar conversas de um cliente específico
   */
  getConversationsByCustomer: async (customerId: string): Promise<Conversation[]> => {
    const response = await api.get(`${CHAT_BASE_URL}/conversations/customer/${customerId}`);
    return response.data;
  },

  /**
   * Atualizar conversa (status, título, etc)
   */
  updateConversation: async (id: string, data: UpdateConversationDto): Promise<Conversation> => {
    const response = await api.patch(`${CHAT_BASE_URL}/conversations/${id}`, data);
    return response.data;
  },

  /**
   * Enviar mensagem em uma conversa
   */
  sendMessage: async (data: SendMessageDto): Promise<any> => {
    const response = await api.post(`${CHAT_BASE_URL}/messages`, data);
    return response.data;
  },

  /**
   * Marcar mensagens como lidas
   */
  markAsRead: async (conversationId: string): Promise<void> => {
    await api.post(`${CHAT_BASE_URL}/conversations/${conversationId}/read`);
  },

  /**
   * Obter contador de mensagens não lidas
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<UnreadCountResponse>(`${CHAT_BASE_URL}/unread/count`);
    return response.data.count;
  },

  /**
   * Conectar ao stream SSE para atualizações em tempo real
   * @param conversationId ID da conversa para monitorar
   * @param onMessage Callback para quando uma nova mensagem chegar
   * @param onError Callback para erros
   * @returns Função para fechar a conexão
   */
  connectSSE: (
    conversationId: string | null,
    onMessage: (data: any) => void,
    onError?: (error: Event) => void
  ): (() => void) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token não encontrado para SSE');
      return () => {};
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const url = conversationId
      ? `${baseUrl}${CHAT_BASE_URL}/stream?conversationId=${conversationId}`
      : `${baseUrl}${CHAT_BASE_URL}/stream`;

    const eventSource = new EventSource(url, {
      withCredentials: false,
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Erro ao processar mensagem SSE:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Erro na conexão SSE:', error);
      if (onError) onError(error);
      eventSource.close();
    };

    // Retorna função para fechar a conexão
    return () => {
      eventSource.close();
    };
  },
};
