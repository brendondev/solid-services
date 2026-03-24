import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface NotificationItem {
  id: string;
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

/**
 * Cliente da API de Notificações
 */
class NotificationsAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Lista notificações do usuário
   */
  async getNotifications(unreadOnly: boolean = false): Promise<NotificationItem[]> {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: this.getAuthHeaders(),
      params: { unreadOnly: unreadOnly ? 'true' : 'false' },
    });
    return response.data;
  }

  /**
   * Conta notificações não lidas
   */
  async getUnreadCount(): Promise<number> {
    const response = await axios.get(`${API_URL}/notifications/unread/count`, {
      headers: this.getAuthHeaders(),
    });
    return response.data.count;
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: string): Promise<void> {
    await axios.patch(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  /**
   * Marca todas notificações como lidas
   */
  async markAllAsRead(): Promise<void> {
    await axios.post(
      `${API_URL}/notifications/read-all`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  /**
   * Deleta notificação
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await axios.delete(`${API_URL}/notifications/${notificationId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Cria conexão SSE para notificações em tempo real
   */
  createEventSource(): EventSource {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    // EventSource não suporta headers customizados, então passamos o token via query param
    const url = `${API_URL}/notifications/stream?token=${encodeURIComponent(token)}`;

    const eventSource = new EventSource(url, {
      withCredentials: true,
    });

    return eventSource;
  }
}

export const notificationsAPI = new NotificationsAPI();
