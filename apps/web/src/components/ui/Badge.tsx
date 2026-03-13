import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full';

  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-orange-100 text-orange-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}

// Status badge helper
interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusMap: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
    // Customer status
    active: { label: 'Ativo', variant: 'success' },
    inactive: { label: 'Inativo', variant: 'default' },

    // Quotation status
    draft: { label: 'Rascunho', variant: 'default' },
    sent: { label: 'Enviado', variant: 'info' },
    approved: { label: 'Aprovado', variant: 'success' },
    rejected: { label: 'Rejeitado', variant: 'error' },

    // Order status
    open: { label: 'Aberto', variant: 'default' },
    scheduled: { label: 'Agendado', variant: 'info' },
    in_progress: { label: 'Em Andamento', variant: 'warning' },
    completed: { label: 'Concluído', variant: 'success' },
    cancelled: { label: 'Cancelado', variant: 'error' },

    // Payment status
    pending: { label: 'Pendente', variant: 'warning' },
    paid: { label: 'Pago', variant: 'success' },
    overdue: { label: 'Vencido', variant: 'error' },
  };

  const config = statusMap[status] || { label: status, variant: 'default' as const };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
