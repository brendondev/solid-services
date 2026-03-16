import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token e tenant-id
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    console.log('[API Client] Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('[API Client] No token found in localStorage!');
    }

    // Adicionar tenant-id ao header se disponível
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.tenantId) {
          config.headers['X-Tenant-ID'] = userData.tenantId;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Client] Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
      method: error.config?.method,
    });

    // Apenas redirecionar para login em caso de 401 (não autenticado)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        console.error('[API Client] Token expirado ou inválido, redirecionando para login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
