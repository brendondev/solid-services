'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary genérico para uso em componentes específicos
 * Para rotas, use os arquivos error.tsx do Next.js
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log para serviço de monitoramento (Sentry, LogRocket, etc.)
    console.error('ErrorBoundary caught error:', error, errorInfo);

    // TODO: Enviar para serviço de logging
    // sendErrorToLoggingService(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          reset={this.reset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Fallback UI padrão para erros
 */
function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Algo deu errado
          </h2>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 p-3 bg-muted rounded-lg">
            <summary className="text-sm font-medium cursor-pointer text-gray-700 hover:text-gray-900">
              Detalhes do erro (dev only)
            </summary>
            <pre className="mt-2 text-xs text-destructive overflow-auto">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-2">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/main'}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted text-gray-700 rounded-lg hover:bg-muted/80 transition-colors min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            Ir para início
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
