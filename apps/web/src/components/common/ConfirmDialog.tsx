'use client';

import { useState } from 'react';
import { AlertTriangle, Info, XCircle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  isLoading?: boolean;
  onConfirm: (reason?: string) => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  requireReason = false,
  reasonLabel = 'Motivo',
  reasonPlaceholder = 'Informe o motivo...',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError('Por favor, informe o motivo');
      return;
    }

    setError('');
    await onConfirm(reason.trim() || undefined);
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    setError('');
    onCancel();
  };

  const variantConfig = {
    danger: {
      icon: XCircle,
      iconColor: 'text-destructive',
      iconBg: 'bg-destructive/10',
      borderColor: 'border-destructive/20',
      buttonClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-warning',
      iconBg: 'bg-warning/10',
      borderColor: 'border-warning/20',
      buttonClass: 'bg-warning text-warning-foreground hover:bg-warning/90',
    },
    info: {
      icon: Info,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      borderColor: 'border-primary/20',
      buttonClass: 'bg-primary text-primary-foreground hover:bg-primary/90',
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scaleIn">
        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b border-border">
          <div className={`p-3 ${config.iconBg} rounded-lg flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {requireReason && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {reasonLabel} *
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError('');
                }}
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={reasonPlaceholder}
                autoFocus
                disabled={isLoading}
              />
              {error && (
                <p className="mt-1 text-sm text-destructive">{error}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Este motivo será registrado nos logs de auditoria
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 bg-muted/30 border-t border-border">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 ${config.buttonClass}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
