'use client';

import { useEffect, useRef } from 'react';

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

/**
 * Componente Cloudflare Turnstile (CAPTCHA)
 *
 * @param siteKey - Site key da Cloudflare (NEXT_PUBLIC_TURNSTILE_SITE_KEY)
 * @param onVerify - Callback quando o usuário completa o desafio
 * @param onError - Callback quando ocorre um erro
 * @param onExpire - Callback quando o token expira
 */
export function Turnstile({ siteKey, onVerify, onError, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Carregar script do Turnstile
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (containerRef.current && window.turnstile) {
        // Renderizar widget
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          'error-callback': onError,
          'expired-callback': onExpire,
          theme: 'light',
          size: 'normal',
        });
      }
    };

    return () => {
      // Cleanup: remover widget ao desmontar
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      document.head.removeChild(script);
    };
  }, [siteKey, onVerify, onError, onExpire]);

  return <div ref={containerRef} />;
}

// Declaração de tipos para o objeto global turnstile
declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: any) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}
