'use client';

import { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { schedulingApi, ScheduledOrder } from '@/lib/api/scheduling';
import { useRouter } from 'next/navigation';
import { Plus, CalendarIcon, Clock, PlayCircle, CheckCircle, Loader2 } from 'lucide-react';

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-muted-foreground mt-1">Visualize e gerencie os agendamentos</p>
        </div>

        <button
          onClick={() => router.push('/dashboard/orders/new')}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nova Ordem
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Legenda */}
      <div className="bg-white p-4 rounded-lg shadow border border-border">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">Agendado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-warning/10 rounded-lg">
              <PlayCircle className="w-4 h-4 text-warning" />
            </div>
            <span className="text-sm text-gray-700 font-medium">Em Andamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <span className="text-sm text-gray-700 font-medium">Concluído</span>
          </div>
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-white p-6 rounded-lg shadow border border-border" style={{ height: '700px' }}>
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
