'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import type { ScheduledOrder } from '@/lib/api/scheduling';

interface WeekCalendarProps {
  orders: ScheduledOrder[];
  onOrderClick?: (order: ScheduledOrder) => void;
  onSlotClick?: (date: Date, hour: number) => void;
}

export default function WeekCalendar({
  orders,
  onOrderClick,
  onSlotClick,
}: WeekCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    getWeekStart(new Date())
  );

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8h às 18h

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const getOrdersForSlot = (date: Date, hour: number) => {
    return orders.filter((order) => {
      const orderDate = new Date(order.scheduledFor);
      return (
        orderDate.getDate() === date.getDate() &&
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getFullYear() === date.getFullYear() &&
        orderDate.getHours() === hour
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentWeekStart.toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              Hoje
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-3 text-sm font-medium text-gray-500">Horário</div>
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`p-3 text-center ${
                  isToday(day) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="text-sm font-medium text-gray-900">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </div>
                <div
                  className={`text-lg font-semibold mt-1 ${
                    isToday(day) ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-8 border-b border-gray-200 min-h-[80px]"
            >
              <div className="p-3 text-sm text-gray-500 border-r border-gray-200">
                {hour}:00
              </div>
              {weekDays.map((day) => {
                const slotOrders = getOrdersForSlot(day, hour);
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className={`p-1 border-r border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      isToday(day) ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() =>
                      !slotOrders.length &&
                      onSlotClick &&
                      onSlotClick(day, hour)
                    }
                  >
                    {slotOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOrderClick && onOrderClick(order);
                        }}
                        className={`p-2 mb-1 rounded text-xs cursor-pointer ${
                          order.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                        }`}
                      >
                        <div className="font-medium truncate">
                          OS #{order.number}
                        </div>
                        <div className="truncate text-xs mt-0.5">
                          {order.customer.name}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
            <span className="text-gray-700">Agendado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
            <span className="text-gray-700">Em Andamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
            <span className="text-gray-700">Hoje</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}
