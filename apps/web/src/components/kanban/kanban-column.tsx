'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { KanbanCard } from './kanban-card';

export interface KanbanOrder {
  id: string;
  title: string;
  customer: string;
  technician?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  value?: number;
  status: string;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  orders: KanbanOrder[];
  onCardClick?: (order: KanbanOrder) => void;
}

export function KanbanColumn({
  id,
  title,
  orders,
  onCardClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={cn(
        'flex flex-col min-w-[240px] max-w-[240px] sm:min-w-[260px] sm:max-w-[260px] bg-muted/30 rounded-lg p-3 sm:p-4 h-full',
        isOver && 'bg-muted/50 ring-2 ring-primary'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-semibold text-xs sm:text-sm">{title}</h3>
        <span className="text-[10px] sm:text-xs text-muted-foreground bg-background rounded-full px-1.5 sm:px-2 py-0.5">
          {orders.length}
        </span>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto space-y-1.5 sm:space-y-2 min-h-[150px] sm:min-h-[200px]"
      >
        <SortableContext
          items={orders.map((o) => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {orders.map((order) => (
            <KanbanCard
              key={order.id}
              id={order.id}
              title={order.title}
              customer={order.customer}
              technician={order.technician}
              dueDate={order.dueDate}
              priority={order.priority}
              value={order.value}
              onClick={() => onCardClick?.(order)}
            />
          ))}
        </SortableContext>

        {orders.length === 0 && (
          <div className="flex items-center justify-center h-24 sm:h-32 text-xs sm:text-sm text-muted-foreground">
            Nenhuma ordem
          </div>
        )}
      </div>
    </div>
  );
}
