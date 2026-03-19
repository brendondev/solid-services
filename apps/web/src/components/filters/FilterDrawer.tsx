'use client';

import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  onClear?: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  showFooter?: boolean;
  applyButtonText?: string;
  clearButtonText?: string;
}

/**
 * Drawer/Modal para filtros avançados
 *
 * Usa Dialog do shadcn/ui
 * Responsivo (drawer no mobile, modal no desktop)
 *
 * @example
 * ```tsx
 * <FilterDrawer
 *   isOpen={showFilters}
 *   onClose={() => setShowFilters(false)}
 *   onApply={() => applyFilters()}
 *   onClear={() => clearFilters()}
 * >
 *   <FilterSection title="Status">
 *     <Checkbox />
 *   </FilterSection>
 * </FilterDrawer>
 * ```
 */
export function FilterDrawer({
  isOpen,
  onClose,
  onApply,
  onClear,
  title = 'Filtros Avançados',
  description = 'Refine sua busca com filtros personalizados',
  children,
  className,
  showFooter = true,
  applyButtonText = 'Aplicar Filtros',
  clearButtonText = 'Limpar Tudo',
}: FilterDrawerProps) {
  const handleApply = () => {
    onApply?.();
    onClose();
  };

  const handleClear = () => {
    onClear?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0',
          // Mobile: drawer-like from bottom
          'sm:max-w-2xl',
          className
        )}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">{children}</div>
        </div>

        {/* Footer */}
        {showFooter && (
          <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-row gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="flex-1 sm:flex-none"
            >
              {clearButtonText}
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              className="flex-1 sm:flex-none"
            >
              {applyButtonText}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
