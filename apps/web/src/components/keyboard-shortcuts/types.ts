/**
 * Keyboard Shortcuts Types
 *
 * Definições de tipos TypeScript para o sistema de atalhos de teclado
 */

export interface KeyboardShortcut {
  /** A tecla principal do atalho (ex: 'k', 'n', '?') */
  key: string;

  /** Se requer a tecla Ctrl/Cmd pressionada */
  ctrl?: boolean;

  /** Se requer a tecla Alt/Option pressionada */
  alt?: boolean;

  /** Se requer a tecla Shift pressionada */
  shift?: boolean;

  /** Função callback executada quando o atalho é acionado */
  callback: () => void;

  /** Descrição do atalho para exibir no help */
  description: string;

  /** Categoria do atalho para agrupamento (ex: 'Navegação', 'Ações') */
  category?: string;

  /** Se deve prevenir o comportamento padrão do navegador */
  preventDefault?: boolean;

  /** ID único do atalho (gerado automaticamente) */
  id?: string;
}

export interface ShortcutOptions {
  /** Descrição do atalho */
  description: string;

  /** Categoria para agrupamento */
  category?: string;

  /** Se deve prevenir o comportamento padrão */
  preventDefault?: boolean;

  /** Se requer Ctrl/Cmd */
  ctrl?: boolean;

  /** Se requer Alt/Option */
  alt?: boolean;

  /** Se requer Shift */
  shift?: boolean;
}

export interface KeyboardShortcutsContextValue {
  /** Lista de todos os atalhos registrados */
  shortcuts: KeyboardShortcut[];

  /** Registra um novo atalho de teclado */
  registerShortcut: (
    key: string,
    callback: () => void,
    options?: ShortcutOptions
  ) => () => void;

  /** Remove um atalho específico pelo ID */
  unregisterShortcut: (id: string) => void;

  /** Abre o dialog de ajuda dos atalhos */
  openHelp: () => void;

  /** Fecha o dialog de ajuda dos atalhos */
  closeHelp: () => void;

  /** Estado de abertura do dialog de ajuda */
  isHelpOpen: boolean;
}

export type ShortcutCategory =
  | 'Navegação'
  | 'Ações'
  | 'Edição'
  | 'Lista'
  | 'Geral'
  | string;
