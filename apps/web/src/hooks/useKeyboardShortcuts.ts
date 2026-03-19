'use client';

/**
 * useKeyboardShortcuts Hook
 *
 * Hook customizado para registrar e gerenciar atalhos de teclado.
 * Fornece uma API simples para componentes registrarem seus próprios atalhos.
 *
 * @example
 * ```tsx
 * const { registerShortcut } = useKeyboardShortcuts();
 *
 * useEffect(() => {
 *   const unregister = registerShortcut('n', () => router.push('/new'), {
 *     description: 'Criar novo cliente',
 *     category: 'Ações',
 *     preventDefault: true,
 *   });
 *   return unregister;
 * }, []);
 * ```
 */

import { useEffect, useCallback } from 'react';
import { useKeyboardShortcutsContext } from '@/components/keyboard-shortcuts/KeyboardShortcutsProvider';
import { ShortcutOptions } from '@/components/keyboard-shortcuts/types';

export function useKeyboardShortcuts() {
  const { registerShortcut: registerShortcutContext, openHelp } =
    useKeyboardShortcutsContext();

  /**
   * Registra um atalho de teclado
   *
   * @param key - A tecla do atalho (ex: 'n', 'k', '/')
   * @param callback - Função executada quando o atalho é acionado
   * @param options - Opções adicionais (modificadores, descrição, etc)
   * @returns Função de cleanup para remover o atalho
   */
  const registerShortcut = useCallback(
    (
      key: string,
      callback: () => void,
      options?: ShortcutOptions
    ): (() => void) => {
      return registerShortcutContext(key, callback, options);
    },
    [registerShortcutContext]
  );

  /**
   * Registra múltiplos atalhos de uma vez
   *
   * @example
   * ```tsx
   * registerMultiple([
   *   { key: 'n', callback: handleNew, description: 'Novo' },
   *   { key: 'e', callback: handleEdit, description: 'Editar' },
   * ]);
   * ```
   */
  const registerMultiple = useCallback(
    (
      shortcuts: Array<{
        key: string;
        callback: () => void;
        options?: ShortcutOptions;
      }>
    ): (() => void) => {
      const unregisterFunctions = shortcuts.map((shortcut) =>
        registerShortcutContext(shortcut.key, shortcut.callback, shortcut.options)
      );

      // Retorna função que remove todos os atalhos
      return () => {
        unregisterFunctions.forEach((unregister) => unregister());
      };
    },
    [registerShortcutContext]
  );

  return {
    registerShortcut,
    registerMultiple,
    openHelp,
  };
}

/**
 * Hook conveniente para registrar atalhos com auto-cleanup
 *
 * Registra automaticamente os atalhos quando o componente monta
 * e remove quando desmonta.
 *
 * @example
 * ```tsx
 * useAutoRegisterShortcuts([
 *   {
 *     key: 'n',
 *     callback: () => router.push('/customers/new'),
 *     options: { description: 'Novo cliente', category: 'Ações' }
 *   },
 *   {
 *     key: 'e',
 *     callback: handleEdit,
 *     options: { description: 'Editar', category: 'Ações' }
 *   }
 * ]);
 * ```
 */
export function useAutoRegisterShortcuts(
  shortcuts: Array<{
    key: string;
    callback: () => void;
    options?: ShortcutOptions;
  }>,
  deps: React.DependencyList = []
) {
  const { registerMultiple } = useKeyboardShortcuts();

  useEffect(() => {
    const unregister = registerMultiple(shortcuts);
    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook para registrar atalhos de navegação comuns
 *
 * @example
 * ```tsx
 * useNavigationShortcuts({
 *   onNew: () => router.push('/customers/new'),
 *   onSearch: () => searchInputRef.current?.focus(),
 * });
 * ```
 */
export function useNavigationShortcuts(options: {
  onNew?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSearch?: () => void;
  category?: string;
}) {
  const { registerMultiple } = useKeyboardShortcuts();
  const category = options.category || 'Navegação';

  useEffect(() => {
    const shortcuts = [];

    if (options.onNew) {
      shortcuts.push({
        key: 'n',
        callback: options.onNew,
        options: {
          description: 'Criar novo item',
          category,
        },
      });
    }

    if (options.onEdit) {
      shortcuts.push({
        key: 'e',
        callback: options.onEdit,
        options: {
          description: 'Editar item selecionado',
          category,
        },
      });
    }

    if (options.onDelete) {
      shortcuts.push({
        key: 'delete',
        callback: options.onDelete,
        options: {
          description: 'Excluir item selecionado',
          category,
        },
      });
    }

    if (options.onSearch) {
      shortcuts.push({
        key: '/',
        callback: options.onSearch,
        options: {
          description: 'Focar na busca',
          category,
        },
      });
    }

    if (shortcuts.length === 0) {
      return;
    }

    const unregister = registerMultiple(shortcuts);
    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.onNew, options.onEdit, options.onDelete, options.onSearch]);
}
