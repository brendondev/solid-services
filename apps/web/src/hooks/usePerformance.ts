import { useEffect, useRef } from 'react';

/**
 * Hook para monitorar performance de componentes
 */
export function useComponentPerformance(componentName: string) {
  const renderCount = useRef(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;

    if (renderCount.current === 1) {
      mountTime.current = performance.now();
    }

    // Log apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} renderizado ${renderCount.current} vezes`);
    }

    return () => {
      if (renderCount.current === 1) {
        const unmountTime = performance.now();
        const lifeTime = unmountTime - mountTime.current;

        if (process.env.NODE_ENV === 'development' && lifeTime > 1000) {
          console.warn(
            `[Performance] ${componentName} ficou montado por ${lifeTime.toFixed(2)}ms`
          );
        }
      }
    };
  });

  return {
    renderCount: renderCount.current,
  };
}

/**
 * Hook para medir tempo de execução de funções
 */
export function usePerformanceMeasure() {
  const measure = (label: string, fn: () => void | Promise<void>) => {
    const start = performance.now();

    const result = fn();

    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now();
        const duration = end - start;

        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
        }

        // Reportar para analytics em produção
        if (process.env.NODE_ENV === 'production' && duration > 1000) {
          // TODO: Integrar com analytics
          console.warn(`[Performance] Operação lenta: ${label} (${duration.toFixed(2)}ms)`);
        }
      });
    } else {
      const end = performance.now();
      const duration = end - start;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
      }

      return result;
    }
  };

  return { measure };
}

/**
 * Hook para detectar renderizações desnecessárias
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = useRef<Record<string, any> | undefined>(undefined);

  useEffect(() => {
    if (previousProps.current && process.env.NODE_ENV === 'development') {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log(`[WhyDidYouUpdate] ${name}:`, changedProps);
      }
    }

    previousProps.current = props;
  });
}

/**
 * Reportar Web Vitals para analytics
 */
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    // Métricas importantes do Core Web Vitals
    const { name, value, id } = metric;

    // TODO: Enviar para analytics (Google Analytics, Sentry, etc)
    console.log(`[Web Vitals] ${name}:`, {
      value,
      id,
      label: name === 'CLS' || name === 'FID' || name === 'LCP' ? 'web-vital' : 'custom',
    });

    // Exemplo de envio para Google Analytics
    // if (window.gtag) {
    //   window.gtag('event', name, {
    //     event_category: 'Web Vitals',
    //     value: Math.round(name === 'CLS' ? value * 1000 : value),
    //     event_label: id,
    //     non_interaction: true,
    //   });
    // }
  }
}
