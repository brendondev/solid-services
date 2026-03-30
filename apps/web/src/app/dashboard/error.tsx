'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log erro para serviço de monitoramento
    console.error('Dashboard error:', error);

    // TODO: Enviar para Sentry, LogRocket, etc.
    // logErrorToService({
    //   error,
    //   digest: error.digest,
    //   context: 'dashboard'
    // });
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-card rounded-lg shadow-lg border border-border p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Erro no Dashboard
            </h2>
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar esta página
            </p>
          </div>
        </div>

        {/* Mensagem */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-foreground">
            {getErrorMessage(error)}
          </p>
        </div>

        {/* Detalhes técnicos (apenas dev) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 p-4 bg-muted rounded-lg">
            <summary className="text-sm font-medium cursor-pointer text-foreground hover:text-foreground/80 mb-2">
              🔧 Detalhes técnicos
            </summary>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Mensagem:</p>
                <pre className="text-xs text-destructive overflow-auto bg-card p-2 rounded border">
                  {error.message}
                </pre>
              </div>
              {error.digest && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Digest:</p>
                  <code className="text-xs text-muted-foreground bg-card px-2 py-1 rounded border">
                    {error.digest}
                  </code>
                </div>
              )}
              {error.stack && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Stack trace:</p>
                  <pre className="text-xs text-muted-foreground overflow-auto bg-card p-2 rounded border max-h-48">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Ações */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors font-medium min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
            <button
              onClick={() => router.push('/dashboard/main')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 active:bg-muted/90 transition-colors font-medium min-h-[44px]"
            >
              <Home className="w-4 h-4" />
              Dashboard inicial
            </button>
          </div>

          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para página anterior
          </button>
        </div>

        {/* ID do erro */}
        {error.digest && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              ID do erro: <code className="text-xs bg-muted px-2 py-1 rounded">{error.digest}</code>
            </p>
            <p className="text-xs text-center text-muted-foreground mt-1">
              Guarde este ID se precisar reportar o problema
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Retorna mensagem amigável baseada no tipo de erro
 */
function getErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('fetch')) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.';
  }

  if (message.includes('unauthorized') || message.includes('401')) {
    return 'Sua sessão expirou. Por favor, faça login novamente.';
  }

  if (message.includes('forbidden') || message.includes('403')) {
    return 'Você não tem permissão para acessar este recurso.';
  }

  if (message.includes('not found') || message.includes('404')) {
    return 'O recurso solicitado não foi encontrado.';
  }

  if (message.includes('timeout')) {
    return 'A solicitação demorou muito tempo. Por favor, tente novamente.';
  }

  return 'Ocorreu um erro inesperado. Por favor, tente novamente em alguns instantes.';
}
