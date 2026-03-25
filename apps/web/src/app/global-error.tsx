'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Global Error Boundary
 * Captura erros no layout raiz e em toda a aplicação
 * Este componente DEVE incluir as tags <html> e <body>
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log crítico para serviço de monitoramento
    console.error('GLOBAL ERROR:', error);

    // TODO: Enviar para Sentry com prioridade alta
    // logCriticalError({
    //   error,
    //   digest: error.digest,
    //   level: 'critical',
    //   context: 'global'
    // });
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Card principal */}
            <div className="bg-white rounded-lg shadow-xl border border-border p-6 sm:p-8">
              {/* Ícone e título */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="p-4 bg-destructive/10 rounded-full mb-4">
                  <AlertTriangle className="w-12 h-12 text-destructive" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Erro Crítico
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  A aplicação encontrou um erro crítico
                </p>
              </div>

              {/* Mensagem */}
              <div className="mb-6 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <p className="text-sm text-gray-700 text-center">
                  Algo deu muito errado. Por favor, recarregue a página ou entre em contato com o suporte se o problema persistir.
                </p>
              </div>

              {/* Detalhes em desenvolvimento */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mb-6 p-4 bg-gray-100 rounded-lg">
                  <summary className="text-sm font-medium cursor-pointer text-gray-700 hover:text-gray-900">
                    Detalhes do erro (dev only)
                  </summary>
                  <div className="mt-3 space-y-2">
                    <pre className="text-xs text-destructive overflow-auto bg-white p-2 rounded border">
                      {error.message}
                    </pre>
                    {error.digest && (
                      <p className="text-xs text-gray-600">
                        Digest: <code className="bg-white px-1 py-0.5 rounded">{error.digest}</code>
                      </p>
                    )}
                    {error.stack && (
                      <pre className="text-xs text-gray-600 overflow-auto bg-white p-2 rounded border max-h-40">
                        {error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Botão de ação */}
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors font-medium min-h-[44px]"
              >
                <RefreshCw className="w-5 h-5" />
                Recarregar aplicação
              </button>

              {/* Informação adicional */}
              {error.digest && (
                <div className="mt-6 pt-4 border-t border-border text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    ID do erro para suporte:
                  </p>
                  <code className="text-xs bg-muted px-3 py-1.5 rounded font-mono">
                    {error.digest}
                  </code>
                </div>
              )}
            </div>

            {/* Link alternativo */}
            <div className="mt-4 text-center">
              <a
                href="/"
                className="text-sm text-primary hover:text-primary/80 underline transition-colors"
              >
                Ou clique aqui para voltar ao início
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
