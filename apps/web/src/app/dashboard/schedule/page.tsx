'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { schedulingApi, ScheduledOrder } from '@/lib/api/scheduling';
import { ordersApi } from '@/lib/api/orders';
import { usersApi, User } from '@/lib/api/users';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  Plus,
  CalendarIcon,
  Clock,
  PlayCircle,
  CheckCircle,
  Loader2,
  Filter,
  X,
  Eye,
  Edit,
  User as UserIcon,
  MapPin,
  Phone,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MobileCard, MobileCardList } from '@/components/responsive';

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

// Calendar com drag & drop
const DnDCalendar = withDragAndDrop(Calendar);

export default function SchedulePage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  const [orders, setOrders] = useState<ScheduledOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<View>(isMobile ? 'agenda' : 'month');
  const [date, setDate] = useState(new Date());

  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    technicianId: 'all' as string,
    status: 'all' as string,
  });

  // Modal de detalhes
  const [selectedOrder, setSelectedOrder] = useState<ScheduledOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [date, view, filters]);

  const loadUsers = async () => {
    try {
      const data = await usersApi.findAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const startDate = format(date, 'yyyy-MM-dd');
      const data = await schedulingApi.getWeekSchedule(filters.technicianId, startDate);

      // Aplicar filtro de status
      let filtered = Array.isArray(data) ? data : [];
      if (filters.status !== 'all') {
        filtered = filtered.filter(o => o.status === filters.status);
      }

      setOrders(filtered);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar agenda');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Converter ordens para eventos do calendário
  const events = useMemo(() => {
    return orders.map((order) => {
      const start = new Date(order.scheduledFor);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hora padrão

      return {
        id: order.id,
        title: `${order.number} - ${order.customer.name}`,
        start,
        end,
        resource: order,
      };
    });
  }, [orders]);

  // Handle drag & drop - reagendar ordem
  const handleEventDrop = useCallback(async ({ event, start, end }: any) => {
    try {
      // Atualizar ordem com nova data
      await ordersApi.update(event.id, {
        scheduledFor: start.toISOString(),
      });

      showToast.success('Ordem reagendada com sucesso!');
      loadOrders(); // Recarregar
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Erro ao reagendar ordem');
    }
  }, []);

  // Handle resize - ajustar duração
  const handleEventResize = useCallback(async ({ event, start, end }: any) => {
    try {
      await ordersApi.update(event.id, {
        scheduledFor: start.toISOString(),
      });

      showToast.success('Duração atualizada!');
      loadOrders();
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Erro ao atualizar duração');
    }
  }, []);

  const handleSelectEvent = (event: any) => {
    setSelectedOrder(event.resource);
    setShowDetailsModal(true);
  };

  const handleSelectSlot = (slotInfo: any) => {
    // Navegar para criar nova ordem com data pré-selecionada
    const scheduledDate = format(slotInfo.start, 'yyyy-MM-dd HH:mm');
    router.push(`/dashboard/orders/new?scheduledFor=${scheduledDate}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#3b82f6'; // blue
      case 'in_progress':
        return '#f59e0b'; // orange
      case 'completed':
        return '#10b981'; // green
      case 'open':
        return '#6b7280'; // gray
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: 'Aberta',
      scheduled: 'Agendada',
      in_progress: 'Em Andamento',
      completed: 'Concluída',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  };

  const eventStyleGetter = (event: any) => {
    const status = event.resource?.status || 'scheduled';
    return {
      style: {
        backgroundColor: getStatusColor(status),
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: isMobile ? '11px' : '13px',
        padding: isMobile ? '2px 4px' : '4px 8px',
      },
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Renderização mobile com cards
  if (isMobile) {
    return (
      <div className="space-y-4 p-4">
        {/* Header Mobile */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(date, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        {/* Actions Mobile */}
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/dashboard/orders/new')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Nova Ordem
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-muted rounded-lg min-h-[44px]"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filtros Mobile */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg border border-border space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Técnico</label>
              <select
                value={filters.technicianId}
                onChange={(e) => setFilters({ ...filters, technicianId: e.target.value })}
                className="w-full min-h-[44px] px-3 rounded-lg border border-border"
              >
                <option value="all">Todos</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full min-h-[44px] px-3 rounded-lg border border-border"
              >
                <option value="all">Todos</option>
                <option value="scheduled">Agendada</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluída</option>
              </select>
            </div>
          </div>
        )}

        {/* Lista Mobile */}
        <MobileCardList items={orders.map((order) => (
          <MobileCard
            key={order.id}
            title={order.number}
            subtitle={order.customer.name}
            badge={{
              label: getStatusLabel(order.status),
              variant: order.status === 'completed' ? 'success' : order.status === 'in_progress' ? 'warning' : 'default',
            }}
            fields={[
              {
                label: 'Data/Hora',
                value: format(new Date(order.scheduledFor), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
                fullWidth: true,
              },
            ]}
            actions={[
              {
                label: 'Ver Detalhes',
                icon: <Eye className="w-4 h-4" />,
                onClick: () => router.push(`/dashboard/orders/${order.id}`),
              },
              {
                label: 'Editar',
                icon: <Edit className="w-4 h-4" />,
                onClick: () => router.push(`/dashboard/orders/${order.id}/edit`),
              },
            ]}
            onClick={() => {
              setSelectedOrder(order);
              setShowDetailsModal(true);
            }}
          />
        ))} loading={loading} />
      </div>
    );
  }

  // Renderização Desktop
  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeInUp p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Visualize e gerencie os agendamentos
          </p>
        </div>

        <button
          onClick={() => router.push('/dashboard/orders/new')}
          className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm min-h-[44px]"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nova Ordem</span>
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filtros Desktop */}
      <div className="bg-white p-4 rounded-lg shadow border border-border">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Técnico:</label>
            <select
              value={filters.technicianId}
              onChange={(e) => setFilters({ ...filters, technicianId: e.target.value })}
              className="px-3 py-1.5 border border-border rounded-lg text-sm min-h-[36px]"
            >
              <option value="all">Todos</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-1.5 border border-border rounded-lg text-sm min-h-[36px]"
            >
              <option value="all">Todos</option>
              <option value="scheduled">Agendada</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluída</option>
            </select>
          </div>

          {(filters.technicianId !== 'all' || filters.status !== 'all') && (
            <button
              onClick={() => setFilters({ technicianId: 'all', status: 'all' })}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-gray-700 transition-colors"
            >
              <X className="w-3 h-3" />
              Limpar filtros
            </button>
          )}
        </div>
      </div>

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
          <div className="ml-auto text-xs text-muted-foreground">
            💡 Dica: Arraste eventos para reagendar
          </div>
        </div>
      </div>

      {/* Calendário com Drag & Drop */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border" style={{ height: '700px' }}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          selectable
          resizable
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

      {/* Modal de Detalhes Rápidos */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Ordem</DialogTitle>
            <DialogDescription>
              Informações rápidas da ordem de serviço
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedOrder.number}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedOrder.scheduledFor), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <Badge
                  variant={
                    selectedOrder.status === 'completed'
                      ? 'success'
                      : selectedOrder.status === 'in_progress'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {getStatusLabel(selectedOrder.status)}
                </Badge>
              </div>

              {/* Cliente */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Cliente:</span>
                  <span>{selectedOrder.customer.name}</span>
                </div>
              </div>

              {/* Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Serviços:</p>
                  <ul className="space-y-1">
                    {selectedOrder.items.map((item, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        {item.quantity}x {item.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => router.push(`/dashboard/orders/${selectedOrder.id}`)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Completo
                </Button>
                <Button
                  onClick={() => router.push(`/dashboard/orders/${selectedOrder.id}/edit`)}
                  variant="outline"
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
