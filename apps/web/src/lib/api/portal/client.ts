import axios from 'axios';

/**
 * Cliente API para Portal do Cliente
 *
 * Usa autenticação via X-Customer-Token ao invés de JWT
 */
const portalApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token do cliente e dígitos do documento
portalApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Extrair token da URL
    const pathParts = window.location.pathname.split('/');
    const tokenIndex = pathParts.indexOf('portal') + 1;
    const token = pathParts[tokenIndex];

    if (token && token !== '[token]') {
      config.headers['X-Customer-Token'] = token;

      // Adicionar dígitos do documento se disponíveis no sessionStorage
      const documentDigits = sessionStorage.getItem('portal-document-digits');
      if (documentDigits) {
        config.headers['X-Document-Digits'] = documentDigits;
      }

      console.log('[Portal API] Request with token:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasToken: true,
        hasDocumentDigits: !!documentDigits,
      });
    }
  }
  return config;
});

// Interceptor para tratar erros
portalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[Portal API] Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
    });

    // Token inválido ou expirado
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        console.error('[Portal API] Token inválido ou expirado');
        // Redirecionar para página de erro ou exibir mensagem
        // Por enquanto, apenas logamos
      }
    }

    return Promise.reject(error);
  }
);

export default portalApi;
