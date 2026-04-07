'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, DollarSign, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  id: string;
  title: string;
  customer: string;
  technician?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  value?: number;
  onClick?: () => void;
}

export function KanbanCard({
  id,
  title,
  customer,
  technician,
  dueDate,
  priority = 'medium',
  value,
  onClick,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  // Verifica se está atrasada
  const isOverdue = dueDate && new Date(dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'touch-none',
        isDragging && 'opacity-50'
      )}
    >
      <Card
        className="mb-2 sm:mb-3 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <CardContent className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
          {/* Header com prioridade */}
          <div className="flex items-start justify-between gap-1.5 sm:gap-2">
            <h4 className="text-xs sm:text-sm font-medium line-clamp-2 flex-1">
              {title}
            </h4>
            <Badge variant="secondary" className={cn('text-[10px] sm:text-xs shrink-0', priorityColors[priority])}>
              {priority === 'low' && 'Baixa'}
              {priority === 'medium' && 'Média'}
              {priority === 'high' && 'Alta'}
            </Badge>
          </div>

          {/* Cliente */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted-foreground">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{customer}</span>
          </div>

          {/* Técnico */}
          {technician && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted-foreground">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{technician}</span>
            </div>
          )}

          {/* Prazo */}
          {dueDate && (
            <div className={cn(
              'flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs',
              isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
            )}>
              {isOverdue && <AlertCircle className="h-3 w-3 shrink-0" />}
              <Calendar className="h-3 w-3 shrink-0" />
              <span>
                {new Date(dueDate).toLocaleDateString('pt-BR')}
                {isOverdue && ' - Atrasada'}
              </span>
            </div>
          )}

          {/* Valor */}
          {value !== undefined && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium">
              <DollarSign className="h-3 w-3 shrink-0" />
              <span>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(value)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
