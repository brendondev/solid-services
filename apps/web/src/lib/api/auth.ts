import api from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    tenantId: string;
    tenantSlug: string;
  };
}

export interface RegisterRequest {
  tenantName: string;
  tenantSlug: string;
  adminName: string;
  adminEmail: string;
  password: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getStoredUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  getStoredToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },
};
