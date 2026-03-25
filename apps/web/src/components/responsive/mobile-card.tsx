import { ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface MobileCardField {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}

interface MobileCardAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

interface MobileCardProps {
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  };
  fields: MobileCardField[];
  actions?: MobileCardAction[];
  onClick?: () => void;
}

/**
 * Card responsivo para exibir dados em mobile
 * Substitui linhas de tabela em telas pequenas
 */
export function MobileCard({
  title,
  subtitle,
  badge,
  fields,
  actions,
  onClick,
}: MobileCardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-border p-4 space-y-3 ${
        onClick ? 'cursor-pointer hover:bg-muted/30 active:bg-muted/50 transition-colors' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {badge && (
            <Badge variant={badge.variant || 'default'} className="text-xs">
              {badge.label}
            </Badge>
          )}
          {actions && actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="p-2 hover:bg-muted rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    className={action.variant === 'destructive' ? 'text-destructive' : ''}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Fields */}
      {fields.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {fields.map((field, index) => (
            <div
              key={index}
              className={field.fullWidth ? 'col-span-2' : 'col-span-1'}
            >
              <p className="text-xs text-muted-foreground mb-0.5">{field.label}</p>
              <div className="text-sm font-medium text-gray-900">
                {field.value || '-'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Lista de cards mobile com skeleton loading
 */
export function MobileCardList({
  items,
  loading,
  skeletonCount = 5,
}: {
  items: ReactNode[];
  loading: boolean;
  skeletonCount?: number;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-border p-4 space-y-3 animate-pulse"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
              <div className="h-6 w-16 bg-muted rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="h-3 bg-muted rounded w-16"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-muted rounded w-16"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum item encontrado
      </div>
    );
  }

  return <div className="space-y-3">{items}</div>;
}

export default MobileCard;
