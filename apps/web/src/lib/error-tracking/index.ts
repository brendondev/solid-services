/**
 * Sistema de Error Tracking
 * Prepara integração com Sentry ou similar
 */

export interface ErrorContext {
  user?: {
    id: string;
    email?: string;
    tenantId?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  level?: 'error' | 'warning' | 'info' | 'debug';
}

class ErrorTrackingService {
  private enabled: boolean;
  private debug: boolean;

  constructor() {
    this.enabled = process.env.NODE_ENV === 'production';
    this.debug = process.env.NODE_ENV === 'development';
  }

  /**
   * Inicializa o Sentry (ou outro provider)
   */
  initialize(config?: { dsn?: string; environment?: string }) {
    if (typeof window === 'undefined') return;

    // TODO: Integrar com Sentry
    // import * as Sentry from '@sentry/nextjs';
    // if (config?.dsn && this.enabled) {
    //   Sentry.init({
    //     dsn: config.dsn,
    //     environment: config.environment || 'production',
    //     tracesSampleRate: 0.1,
    //     replaysSessionSampleRate: 0.1,
    //     replaysOnErrorSampleRate: 1.0,
    //   });
    // }

    if (this.debug) {
      console.log('[Error Tracking] Inicializado');
    }
  }

  /**
   * Captura exceção
   */
  captureException(error: Error, context?: ErrorContext) {
    if (!this.enabled && !this.debug) return;

    // TODO: Integrar com Sentry
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.captureException(error, {
    //   user: context?.user,
    //   tags: context?.tags,
    //   extra: context?.extra,
    //   level: context?.level || 'error',
    // });

    if (this.debug) {
      console.error('[Error Tracking] Exception:', error, context);
    }

    // Log no console em produção também (para ter algum registro)
    if (this.enabled) {
      console.error('[Error]', error.message, error.stack);
    }
  }

  /**
   * Captura mensagem de erro
   */
  captureMessage(message: string, context?: ErrorContext) {
    if (!this.enabled && !this.debug) return;

    // TODO: Integrar com Sentry
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.captureMessage(message, {
    //   level: context?.level || 'info',
    //   tags: context?.tags,
    //   extra: context?.extra,
    // });

    if (this.debug) {
      console.log('[Error Tracking] Message:', message, context);
    }
  }

  /**
   * Adiciona breadcrumb (rastro de navegação)
   */
  addBreadcrumb(message: string, category?: string, data?: Record<string, any>) {
    if (!this.enabled && !this.debug) return;

    // TODO: Integrar com Sentry
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.addBreadcrumb({
    //   message,
    //   category: category || 'navigation',
    //   data,
    //   level: 'info',
    // });

    if (this.debug) {
      console.log('[Error Tracking] Breadcrumb:', message, category, data);
    }
  }

  /**
   * Define contexto do usuário
   */
  setUser(user: { id: string; email?: string; tenantId?: string } | null) {
    if (!this.enabled && !this.debug) return;

    // TODO: Integrar com Sentry
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.setUser(user);

    if (this.debug) {
      console.log('[Error Tracking] User set:', user);
    }
  }

  /**
   * Define tags globais
   */
  setTags(tags: Record<string, string>) {
    if (!this.enabled && !this.debug) return;

    // TODO: Integrar com Sentry
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.setTags(tags);

    if (this.debug) {
      console.log('[Error Tracking] Tags set:', tags);
    }
  }

  /**
   * Define contexto extra
   */
  setContext(key: string, context: Record<string, any>) {
    if (!this.enabled && !this.debug) return;

    // TODO: Integrar com Sentry
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.setContext(key, context);

    if (this.debug) {
      console.log('[Error Tracking] Context set:', key, context);
    }
  }
}

// Singleton
export const errorTracking = new ErrorTrackingService();

// Helper para captura de erros async com contexto
export async function withErrorTracking<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    errorTracking.captureException(error as Error, context);
    throw error;
  }
}

// Helper para try/catch com contexto
export function tryCatch<T>(fn: () => T, context?: ErrorContext): T | null {
  try {
    return fn();
  } catch (error) {
    errorTracking.captureException(error as Error, context);
    return null;
  }
}
