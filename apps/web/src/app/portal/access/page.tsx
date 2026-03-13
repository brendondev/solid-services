'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { customerPortalApi } from '@/lib/api/customer-portal';
import { Button } from '@/components/ui/Button';

/**
 * Componente de validação de token
 */
function TokenValidator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage('Token não fornecido. Verifique o link enviado.');
      return;
    }

    // Validar token
    validateToken(token);
  }, [searchParams]);

  const validateToken = async (token: string) => {
    try {
      customerPortalApi.setToken(token);
      await customerPortalApi.validateToken();

      setStatus('success');

      // Redirecionar para dashboard após 1 segundo
      setTimeout(() => {
        router.push('/portal/dashboard');
      }, 1000);
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(
        error.response?.data?.message || 'Token inválido ou expirado.'
      );
      customerPortalApi.clearToken();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
      {status === 'loading' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Validando acesso...
          </h2>
          <p className="text-gray-600">
            Por favor, aguarde enquanto verificamos suas credenciais.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Acesso autorizado!
          </h2>
          <p className="text-gray-600">
            Redirecionando para seu painel...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Erro de acesso
          </h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Página de Acesso ao Portal do Cliente
 *
 * Valida o token da URL e redireciona para o dashboard
 */
export default function PortalAccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Carregando...
            </h2>
          </div>
        </div>
      }>
        <TokenValidator />
      </Suspense>
    </div>
  );
}
