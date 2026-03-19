'use client';

/**
 * Keyboard Shortcuts Dialog
 *
 * Modal que exibe todos os atalhos de teclado disponíveis no sistema.
 * Abre automaticamente quando o usuário pressiona '?' ou 'Shift+/'.
 *
 * Features:
 * - Agrupa atalhos por categoria
 * - Exibe teclas em formato visual (badges)
 * - Responsivo e acessível
 * - Busca/filtro de atalhos (opcional para futuro)
 */

import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useKeyboardShortcutsContext } from './KeyboardShortcutsProvider';
import { KeyboardShortcut } from './types';
import { Keyboard } from 'lucide-react';

/**
 * Formata a combinação de teclas em um formato legível
 */
function formatShortcutKey(shortcut: KeyboardShortcut): React.ReactNode {
  const keys: string[] = [];

  // Adiciona modificadores na ordem correta
  if (shortcut.ctrl) {
    // Detecta se é Mac para mostrar Cmd ao invés de Ctrl
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
    keys.push(isMac ? 'Cmd' : 'Ctrl');
  }

  if (shortcut.alt) {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
    keys.push(isMac ? 'Option' : 'Alt');
  }

  if (shortcut.shift) {
    keys.push('Shift');
  }

  // Formata a tecla principal
  let mainKey = shortcut.key;
  if (mainKey === ' ') {
    mainKey = 'Space';
  } else if (mainKey === '/') {
    mainKey = '/';
  } else if (mainKey === '?') {
    mainKey = '?';
  } else if (mainKey === 'escape') {
    mainKey = 'Esc';
  } else if (mainKey === 'delete') {
    mainKey = 'Del';
  } else if (mainKey === 'enter') {
    mainKey = 'Enter';
  } else {
    mainKey = mainKey.toUpperCase();
  }

  keys.push(mainKey);

  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <Badge
            variant="outline"
            className="font-mono text-xs px-2 py-0.5 bg-muted"
          >
            {key}
          </Badge>
          {index < keys.length - 1 && (
            <span className="text-muted-foreground text-xs">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Agrupa atalhos por categoria
 */
function groupShortcutsByCategory(
  shortcuts: KeyboardShortcut[]
): Record<string, KeyboardShortcut[]> {
  return shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Geral';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);
}

/**
 * Ordena categorias por prioridade
 */
function sortCategories(categories: string[]): string[] {
  const priorityOrder = ['Navegação', 'Ações', 'Edição', 'Lista', 'Geral'];

  return categories.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a);
    const bIndex = priorityOrder.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    return a.localeCompare(b);
  });
}

export function KeyboardShortcutsDialog() {
  const { shortcuts, isHelpOpen, closeHelp } = useKeyboardShortcutsContext();

  // Agrupa e ordena atalhos
  const groupedShortcuts = useMemo(() => {
    const grouped = groupShortcutsByCategory(shortcuts);
    const sortedCategories = sortCategories(Object.keys(grouped));

    return sortedCategories.map((category) => ({
      category,
      shortcuts: grouped[category],
    }));
  }, [shortcuts]);

  return (
    <Dialog open={isHelpOpen} onOpenChange={(open) => !open && closeHelp()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            <DialogTitle>Atalhos de Teclado</DialogTitle>
          </div>
          <DialogDescription>
            Atalhos disponíveis para navegar e interagir com o sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {groupedShortcuts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Keyboard className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum atalho de teclado registrado</p>
            </div>
          ) : (
            groupedShortcuts.map(({ category, shortcuts: categoryShortcuts }) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {category}
                </h3>

                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={shortcut.id || index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      {formatShortcutKey(shortcut)}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Atalho especial para fechar o help */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Sistema
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="text-sm">Mostrar esta ajuda</span>
                <Badge
                  variant="outline"
                  className="font-mono text-xs px-2 py-0.5 bg-muted"
                >
                  ?
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="text-sm">Fechar modais e diálogos</span>
                <Badge
                  variant="outline"
                  className="font-mono text-xs px-2 py-0.5 bg-muted"
                >
                  Esc
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Pressione{' '}
            <Badge variant="outline" className="font-mono text-xs mx-1">
              ?
            </Badge>{' '}
            a qualquer momento para ver esta ajuda
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
