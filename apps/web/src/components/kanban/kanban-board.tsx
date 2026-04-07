'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn, KanbanOrder } from './kanban-column';
import { KanbanCard } from './kanban-card';

interface Column {
  id: string;
  title: string;
}

interface KanbanBoardProps {
  columns: Column[];
  orders: KanbanOrder[];
  onOrderMove?: (orderId: string, newStatus: string) => void;
  onCardClick?: (order: KanbanOrder) => void;
}

export function KanbanBoard({
  columns,
  orders: initialOrders,
  onOrderMove,
  onCardClick,
}: KanbanBoardProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Agrupa ordens por status
  const ordersByStatus = useMemo(() => {
    const grouped: Record<string, KanbanOrder[]> = {};

    columns.forEach((column) => {
      grouped[column.id] = orders.filter((order) => order.status === column.id);
    });

    return grouped;
  }, [orders, columns]);

  // Ordem ativa sendo arrastada
  const activeOrder = activeId
    ? orders.find((order) => order.id === activeId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Se está sobre outra ordem, não faz nada (será tratado no dragEnd)
    const activeOrder = orders.find((o) => o.id === activeId);
    const overOrder = orders.find((o) => o.id === overId);

    if (!activeOrder) return;

    // Se está sobre uma coluna (não sobre uma ordem)
    if (!overOrder && overId !== activeOrder.status) {
      setOrders((orders) => {
        return orders.map((order) =>
          order.id === activeId
            ? { ...order, status: overId }
            : order
        );
      });
    }

    // Se está sobre outra ordem de status diferente
    if (overOrder && activeOrder.status !== overOrder.status) {
      setOrders((orders) => {
        return orders.map((order) =>
          order.id === activeId
            ? { ...order, status: overOrder.status }
            : order
        );
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeOrder = orders.find((o) => o.id === activeId);
    const overOrder = orders.find((o) => o.id === overId);

    if (!activeOrder) return;

    // Se mudou de coluna, notifica parent
    const originalOrder = initialOrders.find((o) => o.id === activeId);
    if (originalOrder && activeOrder.status !== originalOrder.status) {
      onOrderMove?.(activeId, activeOrder.status);
    }

    // Reordena dentro da mesma coluna
    if (overOrder && activeOrder.status === overOrder.status) {
      setOrders((orders) => {
        const activeIndex = orders.findIndex((o) => o.id === activeId);
        const overIndex = orders.findIndex((o) => o.id === overId);

        return arrayMove(orders, activeIndex, overIndex);
      });
    }
  };

  // Atualiza ordens quando initialOrders mudar
  useMemo(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 sm:pb-4 min-h-[400px] sm:min-h-[500px] max-h-[calc(100vh-16rem)] sm:max-h-[calc(100vh-20rem)] snap-x snap-mandatory scroll-smooth px-2 sm:px-0">
        {columns.map((column) => (
          <div key={column.id} className="snap-center">
            <KanbanColumn
              id={column.id}
              title={column.title}
              orders={ordersByStatus[column.id] || []}
              onCardClick={onCardClick}
            />
          </div>
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeOrder && (
          <div className="rotate-3 opacity-90">
            <KanbanCard
              id={activeOrder.id}
              title={activeOrder.title}
              customer={activeOrder.customer}
              technician={activeOrder.technician}
              dueDate={activeOrder.dueDate}
              priority={activeOrder.priority}
              value={activeOrder.value}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
