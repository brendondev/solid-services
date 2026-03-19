/**
 * Keyboard Shortcuts System
 *
 * Sistema completo de atalhos de teclado para o Solid Service ERP.
 *
 * @example Uso básico
 * ```tsx
 * // 1. Adicione o Provider no root layout
 * import { KeyboardShortcutsProvider, KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <KeyboardShortcutsProvider>
 *       {children}
 *       <KeyboardShortcutsDialog />
 *     </KeyboardShortcutsProvider>
 *   );
 * }
 *
 * // 2. Use o hook em qualquer componente
 * import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
 *
 * function MyComponent() {
 *   const { registerShortcut } = useKeyboardShortcuts();
 *
 *   useEffect(() => {
 *     const unregister = registerShortcut('n', () => {
 *       console.log('Novo item');
 *     }, {
 *       description: 'Criar novo item',
 *       category: 'Ações',
 *     });
 *
 *     return unregister;
 *   }, []);
 * }
 * ```
 */

export { KeyboardShortcutsProvider, useKeyboardShortcutsContext } from './KeyboardShortcutsProvider';
export { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
export type {
  KeyboardShortcut,
  ShortcutOptions,
  KeyboardShortcutsContextValue,
  ShortcutCategory,
} from './types';
