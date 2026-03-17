'use client';

import { useEffect, useRef, useState } from 'react';

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

// Flag global para evitar carregar script múltiplas vezes
let scriptLoaded = false;
let scriptLoading = false;

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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Função para renderizar o widget
    const renderWidget = () => {
      if (!containerRef.current || widgetIdRef.current || !window.turnstile) {
        return;
      }

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          'error-callback': onError,
          'expired-callback': onExpire,
          theme: 'light',
          size: 'normal',
        });
      } catch (error) {
        console.error('[Turnstile] Erro ao renderizar widget:', error);
      }
    };

    // Se o script já está carregado, renderizar imediatamente
    if (scriptLoaded && window.turnstile) {
      renderWidget();
      return;
    }

    // Se o script já está sendo carregado, aguardar
    if (scriptLoading) {
      const checkInterval = setInterval(() => {
        if (scriptLoaded && window.turnstile) {
          clearInterval(checkInterval);
          renderWidget();
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }

    // Carregar script pela primeira vez
    scriptLoading = true;

    // Verificar se o script já existe no DOM
    const existingScript = document.querySelector('script[src*="turnstile"]');
    if (existingScript) {
      scriptLoaded = true;
      scriptLoading = false;
      renderWidget();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      setIsReady(true);
      renderWidget();
    };

    script.onerror = () => {
      scriptLoading = false;
      console.error('[Turnstile] Erro ao carregar script');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup: remover widget ao desmontar
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          // Ignorar erros ao remover
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onVerify, onError, onExpire]);

  return <div ref={containerRef} />;
}

// Declaração de tipos para o objeto global turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: any) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}
