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
        'flex flex-col min-w-[300px] max-w-[300px] bg-muted/30 rounded-lg p-4 h-full',
        isOver && 'bg-muted/50 ring-2 ring-primary'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5">
          {orders.length}
        </span>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto space-y-2 min-h-[200px]"
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
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            Nenhuma ordem
          </div>
        )}
      </div>
    </div>
  );
}
