'use client';

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface FilterChipProps {
  label: string;
  value?: string | number;
  onRemove: () => void;
  className?: string;
}

/**
 * Componente de chip removível para filtros ativos
 *
 * Exibe um badge com label e botão X para remover o filtro
 *
 * @example
 * ```tsx
 * <FilterChip
 *   label="Status"
 *   value="Ativo"
 *   onRemove={() => removeFilter('status')}
 * />
 * ```
 */
export function FilterChip({ label, value, onRemove, className }: FilterChipProps) {
  const displayText = value ? `${label}: ${value}` : label;

  return (
    <Badge
      variant="secondary"
      className={cn(
        'pl-3 pr-2 py-1.5 gap-1.5 text-sm font-normal hover:bg-secondary/80 transition-colors',
        className
      )}
    >
      <span className="truncate max-w-[200px]">{displayText}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary-foreground/10 transition-colors p-0.5"
        aria-label={`Remover filtro ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
