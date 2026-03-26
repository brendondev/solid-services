/**
 * Utilitários para Progressive Web App (PWA)
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Registra o Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[PWA] Service Workers não são suportados neste navegador');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('[PWA] Service Worker registrado com sucesso:', registration.scope);

    // Verificar atualizações a cada 1 hora
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    // Listener para atualizações
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] Nova versão disponível! Por favor, recarregue a página.');
            // Aqui você pode mostrar uma notificação para o usuário
            if (window.confirm('Nova versão disponível! Deseja recarregar a página?')) {
              window.location.reload();
            }
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Erro ao registrar Service Worker:', error);
    return null;
  }
}

/**
 * Desregistra o Service Worker (útil para desenvolvimento)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const unregistered = await registration.unregister();
    console.log('[PWA] Service Worker desregistrado:', unregistered);
    return unregistered;
  } catch (error) {
    console.error('[PWA] Erro ao desregistrar Service Worker:', error);
    return false;
  }
}

/**
 * Verifica se o app está sendo executado como PWA instalado
 */
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;

  // Verifica se está rodando em standalone (instalado)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  // Fallback para navegadores que não suportam display-mode
  const isIOSPWA = 'standalone' in window.navigator && (window.navigator as any).standalone === true;

  return isStandalone || isIOSPWA;
}

/**
 * Verifica se o navegador suporta PWA
 */
export function supportsPWA(): boolean {
  if (typeof window === 'undefined') return false;

  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Solicita permissão para notificações
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('[PWA] Notificações não são suportadas');
    return null;
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Mostra uma notificação local
 */
export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (typeof window === 'undefined') return;

  const permission = await requestNotificationPermission();

  if (permission === 'granted') {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options,
    });
  }
}

/**
 * Hook para gerenciar o prompt de instalação do PWA
 */
export function useInstallPWA() {
  let deferredPrompt: BeforeInstallPromptEvent | null = null;

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
    });
  }

  const installPWA = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('[PWA] Prompt de instalação não está disponível');
      return false;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`[PWA] User response: ${outcome}`);
    deferredPrompt = null;

    return outcome === 'accepted';
  };

  const canInstall = (): boolean => {
    return deferredPrompt !== null;
  };

  return { installPWA, canInstall, isPWA: isPWA() };
}
