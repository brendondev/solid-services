'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface FilterSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Seção de filtro dentro do FilterDrawer
 *
 * Agrupa filtros relacionados com título e descrição opcional
 *
 * @example
 * ```tsx
 * <FilterSection title="Status" description="Selecione um ou mais status">
 *   <Checkbox label="Ativo" />
 *   <Checkbox label="Inativo" />
 * </FilterSection>
 * ```
 */
export function FilterSection({
  title,
  description,
  children,
  className,
}: FilterSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
