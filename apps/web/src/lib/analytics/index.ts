/**
 * Sistema de Analytics centralizado
 * Suporta múltiplos providers (Google Analytics, Vercel Analytics, custom)
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  value?: number;
}

export interface AnalyticsUser {
  id: string;
  email?: string;
  name?: string;
  tenantId?: string;
  plan?: string;
}

class AnalyticsService {
  private enabled: boolean;
  private debug: boolean;

  constructor() {
    this.enabled = process.env.NODE_ENV === 'production';
    this.debug = process.env.NODE_ENV === 'development';
  }

  /**
   * Inicializa os providers de analytics
   */
  initialize(config: { gaId?: string; userId?: string }) {
    if (typeof window === 'undefined') return;

    // Google Analytics 4
    if (config.gaId && this.enabled) {
      this.initializeGA4(config.gaId);
    }

    // Identificar usuário
    if (config.userId) {
      this.identifyUser({ id: config.userId });
    }

    if (this.debug) {
      console.log('[Analytics] Inicializado:', config);
    }
  }

  /**
   * Inicializa Google Analytics 4
   */
  private initializeGA4(gaId: string) {
    if (typeof window === 'undefined') return;

    // Carregar gtag.js
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);

    // Configurar gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', gaId, {
      page_path: window.location.pathname,
    });

    // Expor gtag globalmente
    (window as any).gtag = gtag;

    if (this.debug) {
      console.log('[Analytics] Google Analytics 4 inicializado:', gaId);
    }
  }

  /**
   * Rastrear evento
   */
  track(event: AnalyticsEvent) {
    if (!this.enabled && !this.debug) return;

    const { name, properties, value } = event;

    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', name, {
        ...properties,
        value,
      });
    }

    // Vercel Analytics (se disponível)
    if ((window as any).va) {
      (window as any).va('track', name, properties);
    }

    if (this.debug) {
      console.log('[Analytics] Event:', name, properties);
    }
  }

  /**
   * Rastrear pageview
   */
  pageview(path: string) {
    if (!this.enabled && !this.debug) return;

    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: path,
      });
    }

    // Vercel Analytics
    if ((window as any).va) {
      (window as any).va('pageview', { path });
    }

    if (this.debug) {
      console.log('[Analytics] Pageview:', path);
    }
  }

  /**
   * Identificar usuário
   */
  identifyUser(user: AnalyticsUser) {
    if (!this.enabled && !this.debug) return;

    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('set', 'user_properties', {
        user_id: user.id,
        email: user.email,
        tenant_id: user.tenantId,
        plan: user.plan,
      });
    }

    if (this.debug) {
      console.log('[Analytics] User identified:', user);
    }
  }

  /**
   * Rastrear erro (para analytics, não para error tracking)
   */
  trackError(error: Error, context?: Record<string, any>) {
    this.track({
      name: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
    });
  }

  /**
   * Rastrear conversão
   */
  trackConversion(name: string, value?: number) {
    this.track({
      name: 'conversion',
      properties: { conversion_name: name },
      value,
    });
  }

  /**
   * Rastrear ação do usuário
   */
  trackAction(category: string, action: string, label?: string, value?: number) {
    this.track({
      name: action,
      properties: {
        event_category: category,
        event_label: label,
      },
      value,
    });
  }
}

// Singleton
export const analytics = new AnalyticsService();

// Helpers para eventos comuns
export const trackEvent = {
  // Autenticação
  login: () => analytics.track({ name: 'login' }),
  logout: () => analytics.track({ name: 'logout' }),
  signup: (plan?: string) => analytics.track({ name: 'signup', properties: { plan } }),

  // Clientes
  customerCreated: () => analytics.track({ name: 'customer_created' }),
  customerUpdated: () => analytics.track({ name: 'customer_updated' }),
  customerDeleted: () => analytics.track({ name: 'customer_deleted' }),

  // Ordens de Serviço
  orderCreated: (value?: number) => analytics.track({ name: 'order_created', value }),
  orderUpdated: () => analytics.track({ name: 'order_updated' }),
  orderCompleted: (value?: number) => analytics.track({ name: 'order_completed', value }),
  orderCancelled: () => analytics.track({ name: 'order_cancelled' }),

  // Financeiro
  paymentReceived: (value: number) => analytics.track({ name: 'payment_received', value }),
  invoiceGenerated: () => analytics.track({ name: 'invoice_generated' }),

  // Planos
  planUpgraded: (from: string, to: string) =>
    analytics.track({ name: 'plan_upgraded', properties: { from, to } }),
  planDowngraded: (from: string, to: string) =>
    analytics.track({ name: 'plan_downgraded', properties: { from, to } }),

  // Features
  featureUsed: (feature: string) =>
    analytics.track({ name: 'feature_used', properties: { feature } }),

  // PWA
  pwaInstalled: () => analytics.track({ name: 'pwa_installed' }),
  pwaPromptShown: () => analytics.track({ name: 'pwa_prompt_shown' }),
  pwaPromptDismissed: () => analytics.track({ name: 'pwa_prompt_dismissed' }),

  // Busca
  searchPerformed: (query: string, results: number) =>
    analytics.track({ name: 'search', properties: { query, results } }),
};

// Declaração de tipos para window
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    va?: (...args: any[]) => void;
  }
}
