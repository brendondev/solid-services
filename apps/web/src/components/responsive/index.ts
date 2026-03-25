/**
 * Componentes responsivos e mobile-friendly
 * Otimizados para touch e diferentes tamanhos de tela
 */

export { MobileCard, MobileCardList } from './mobile-card';
export { ScrollHint } from './scroll-hint';
export { TouchInput, TouchTextarea, TouchSelect } from './touch-input';

// Re-export hooks relacionados
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, useDeviceType, breakpoints } from '@/hooks/useMediaQuery';
