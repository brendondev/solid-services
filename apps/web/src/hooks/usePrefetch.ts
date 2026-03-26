import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook para prefetch de rotas críticas
 * Melhora a navegação carregando páginas antecipadamente
 */
export function usePrefetchRoutes(routes: string[], enabled = true) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    // Aguardar o componente montar antes de fazer prefetch
    const timer = setTimeout(() => {
      routes.forEach((route) => {
        router.prefetch(route);
      });
    }, 1000); // 1 segundo após mount

    return () => clearTimeout(timer);
  }, [router, routes, enabled]);
}

/**
 * Rotas críticas do dashboard para prefetch
 */
export const CRITICAL_ROUTES = [
  '/dashboard/main',
  '/dashboard/orders',
  '/dashboard/customers',
  '/dashboard/schedule',
  '/dashboard/financial',
];

/**
 * Hook que faz prefetch automático das rotas críticas
 */
export function useCriticalRoutesPrefetch() {
  usePrefetchRoutes(CRITICAL_ROUTES);
}
