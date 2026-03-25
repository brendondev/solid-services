'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log erro para serviço de monitoramento
    console.error('Root error:', error);

    // TODO: Enviar para Sentry, LogRocket, etc.
    // if (error.digest) {
    //   logErrorToService({ error, digest: error.digest });
    // }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-border p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Algo deu errado
          </h1>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          Ocorreu um erro inesperado ao carregar a página. Por favor, tente novamente.
        </p>

        {/* Mostrar detalhes apenas em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 p-4 bg-muted rounded-lg">
            <summary className="text-sm font-medium cursor-pointer text-gray-700 hover:text-gray-900 mb-2">
              Detalhes técnicos (apenas em desenvolvimento)
            </summary>
            <div className="mt-2 space-y-2">
              <div>
                <p className="text-xs font-medium text-gray-600">Mensagem:</p>
                <pre className="text-xs text-destructive overflow-auto bg-white p-2 rounded border">
                  {error.message}
                </pre>
              </div>
              {error.digest && (
                <div>
                  <p className="text-xs font-medium text-gray-600">Digest:</p>
                  <pre className="text-xs text-gray-600 overflow-auto bg-white p-2 rounded border">
                    {error.digest}
                  </pre>
                </div>
              )}
              {error.stack && (
                <div>
                  <p className="text-xs font-medium text-gray-600">Stack:</p>
                  <pre className="text-xs text-gray-600 overflow-auto bg-white p-2 rounded border max-h-40">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors font-medium min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-muted text-gray-700 rounded-lg hover:bg-muted/80 active:bg-muted/90 transition-colors font-medium min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            Ir para início
          </button>
        </div>

        {error.digest && (
          <p className="mt-4 text-xs text-center text-muted-foreground">
            ID do erro: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
