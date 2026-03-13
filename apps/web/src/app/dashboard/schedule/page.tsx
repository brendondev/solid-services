'use client';

import { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { schedulingApi, ScheduledOrder } from '@/lib/api/scheduling';
import { useRouter } from 'next/navigation';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function SchedulePage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ScheduledOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Por enquanto, vamos buscar todas as ordens agendadas
  // TODO: Adicionar filtro por técnico quando tivermos gestão de usuários
  const technicianId = 'all'; // Placeholder

  useEffect(() => {
    loadOrders();
  }, [date, view]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');

      // Por enquanto, vamos usar a API de week schedule
      const startDate = format(date, 'yyyy-MM-dd');
      const data = await schedulingApi.getWeekSchedule(technicianId, startDate);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar agenda');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Converter ordens para eventos do calendário
  const events = useMemo(() => {
    return orders.map((order) => ({
      id: order.id,
      title: `${order.number} - ${order.customer.name}`,
      start: new Date(order.scheduledFor),
      end: new Date(new Date(order.scheduledFor).getTime() + 60 * 60 * 1000), // +1 hora
      resource: order,
    }));
  }, [orders]);

  const handleSelectEvent = (event: any) => {
    router.push(`/dashboard/orders/${event.id}`);
  };

  const handleSelectSlot = (slotInfo: any) => {
    // TODO: Abrir modal para criar nova ordem neste horário
    console.log('Slot selecionado:', slotInfo);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#3b82f6'; // blue
      case 'in_progress':
        return '#f59e0b'; // orange
      case 'completed':
        return '#10b981'; // green
      default:
        return '#6b7280'; // gray
    }
  };

  const eventStyleGetter = (event: any) => {
    const status = event.resource?.status || 'scheduled';
    return {
      style: {
        backgroundColor: getStatusColor(status),
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando agenda...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600">Visualize e gerencie os agendamentos</p>
        </div>

        <button
          onClick={() => router.push('/dashboard/orders/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nova Ordem
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Legenda */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
          <span className="text-sm text-gray-600">Agendado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
          <span className="text-sm text-gray-600">Em Andamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
          <span className="text-sm text-gray-600">Concluído</span>
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-white p-6 rounded-lg shadow" style={{ height: '700px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          messages={{
            next: 'Próximo',
            previous: 'Anterior',
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            agenda: 'Agenda',
            date: 'Data',
            time: 'Hora',
            event: 'Evento',
            noEventsInRange: 'Nenhum agendamento neste período',
            showMore: (total) => `+ Ver mais (${total})`,
          }}
        />
      </div>
    </div>
  );
}
