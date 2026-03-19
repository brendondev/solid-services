'use client';

/**
 * Keyboard Shortcuts Provider
 *
 * Context Provider que gerencia o estado global de atalhos de teclado.
 * Fornece funcionalidades para:
 * - Registrar e remover atalhos
 * - Armazenar lista de atalhos para exibição
 * - Validar conflitos entre atalhos
 * - Gerenciar estado do dialog de ajuda
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  KeyboardShortcut,
  KeyboardShortcutsContextValue,
  ShortcutOptions,
} from './types';

const KeyboardShortcutsContext = createContext<
  KeyboardShortcutsContextValue | undefined
>(undefined);

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

/**
 * Gera uma chave única para um atalho baseada em suas teclas modificadoras
 */
const generateShortcutKey = (
  key: string,
  ctrl?: boolean,
  alt?: boolean,
  shift?: boolean
): string => {
  const modifiers = [
    ctrl && 'ctrl',
    alt && 'alt',
    shift && 'shift',
  ]
    .filter(Boolean)
    .join('+');

  return modifiers ? `${modifiers}+${key}` : key;
};

/**
 * Gera um ID único para o atalho
 */
const generateShortcutId = (): string => {
  return `shortcut-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Verifica se um elemento é um input onde o usuário está digitando
 */
const isInputElement = (element: Element | null): boolean => {
  if (!element) return false;

  const tagName = element.tagName.toLowerCase();
  const isEditable = element.getAttribute('contenteditable') === 'true';

  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    isEditable
  );
};

export function KeyboardShortcutsProvider({
  children,
}: KeyboardShortcutsProviderProps) {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  /**
   * Registra um novo atalho de teclado
   */
  const registerShortcut = useCallback(
    (
      key: string,
      callback: () => void,
      options?: ShortcutOptions
    ): (() => void) => {
      const id = generateShortcutId();
      const shortcutKey = generateShortcutKey(
        key.toLowerCase(),
        options?.ctrl,
        options?.alt,
        options?.shift
      );

      const newShortcut: KeyboardShortcut = {
        id,
        key: key.toLowerCase(),
        ctrl: options?.ctrl,
        alt: options?.alt,
        shift: options?.shift,
        callback,
        description: options?.description || 'Sem descrição',
        category: options?.category || 'Geral',
        preventDefault: options?.preventDefault ?? true,
      };

      setShortcuts((prev) => {
        // Verifica se já existe um atalho com a mesma combinação de teclas
        const existingShortcut = prev.find(
          (s) =>
            generateShortcutKey(s.key, s.ctrl, s.alt, s.shift) === shortcutKey
        );

        if (existingShortcut) {
          console.warn(
            `Atalho duplicado detectado: ${shortcutKey}. ` +
              `Substituindo "${existingShortcut.description}" por "${newShortcut.description}"`
          );
          // Remove o atalho existente
          return [...prev.filter((s) => s.id !== existingShortcut.id), newShortcut];
        }

        return [...prev, newShortcut];
      });

      // Retorna função de cleanup para remover o atalho
      return () => {
        setShortcuts((prev) => prev.filter((s) => s.id !== id));
      };
    },
    []
  );

  /**
   * Remove um atalho específico pelo ID
   */
  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id));
  }, []);

  /**
   * Abre o dialog de ajuda
   */
  const openHelp = useCallback(() => {
    setIsHelpOpen(true);
  }, []);

  /**
   * Fecha o dialog de ajuda
   */
  const closeHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);

  /**
   * Handler global de eventos de teclado
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignora eventos de teclado quando o usuário está digitando
      if (isInputElement(event.target as Element)) {
        return;
      }

      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey; // metaKey para Cmd no Mac
      const alt = event.altKey;
      const shift = event.shiftKey;

      // Atalho especial para abrir o help (? ou Shift+/)
      if (key === '?' || (shift && key === '/')) {
        event.preventDefault();
        setIsHelpOpen(true);
        return;
      }

      // Atalho especial para fechar modais com Escape
      if (key === 'escape') {
        setIsHelpOpen(false);
        return;
      }

      // Procura por um atalho correspondente
      const matchingShortcut = shortcuts.find((shortcut) => {
        return (
          shortcut.key === key &&
          !!shortcut.ctrl === ctrl &&
          !!shortcut.alt === alt &&
          !!shortcut.shift === shift
        );
      });

      if (matchingShortcut) {
        if (matchingShortcut.preventDefault) {
          event.preventDefault();
        }
        matchingShortcut.callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);

  const value = useMemo<KeyboardShortcutsContextValue>(
    () => ({
      shortcuts,
      registerShortcut,
      unregisterShortcut,
      openHelp,
      closeHelp,
      isHelpOpen,
    }),
    [shortcuts, registerShortcut, unregisterShortcut, openHelp, closeHelp, isHelpOpen]
  );

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

/**
 * Hook para usar o contexto de atalhos de teclado
 */
export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);

  if (context === undefined) {
    throw new Error(
      'useKeyboardShortcutsContext deve ser usado dentro de um KeyboardShortcutsProvider'
    );
  }

  return context;
}
