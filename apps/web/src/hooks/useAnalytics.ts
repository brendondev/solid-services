import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/lib/analytics';

/**
 * Hook para rastrear pageviews automaticamente
 */
export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = searchParams ? `${pathname}?${searchParams}` : pathname;
      analytics.pageview(url);
    }
  }, [pathname, searchParams]);
}

/**
 * Hook para inicializar analytics com dados do usuário
 */
export function useAnalyticsInit(user?: {
  id: string;
  email?: string;
  tenantId?: string;
  plan?: string;
}) {
  useEffect(() => {
    analytics.initialize({
      gaId: process.env.NEXT_PUBLIC_GA_ID,
      userId: user?.id,
    });

    if (user) {
      analytics.identifyUser(user);
    }
  }, [user]);
}
