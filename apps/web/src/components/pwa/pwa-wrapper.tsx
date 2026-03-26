'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa';
import { InstallPWAPrompt } from './install-prompt';

export function PWAWrapper() {
  useEffect(() => {
    // Registrar service worker apenas em produção
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker()
        .then((registration) => {
          if (registration) {
            console.log('[PWA] Service Worker registrado com sucesso');
          }
        })
        .catch((error) => {
          console.error('[PWA] Erro ao registrar Service Worker:', error);
        });
    }
  }, []);

  return (
    <>
      {/* Prompt de instalação do PWA */}
      <InstallPWAPrompt />
    </>
  );
}
