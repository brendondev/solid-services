'use client';

import { useEffect, useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addDays, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { schedulingApi, ScheduledOrder } from '@/lib/api/scheduling';
import { ordersApi } from '@/lib/api/orders';
import { usersApi, User } from '@/lib/api/users';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  LayoutGrid,
  LayoutList,
  Filter,
  X,
  Eye,
  Edit,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

type ViewMode = 'month' | 'week' | 'day';

export default function SchedulePage() {
  const router = useRouter();

  const [orders, setOrders] = useState<ScheduledOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedOrder, setSelectedOrder] = useState<ScheduledOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    technicianId: 'all' as string,
    status: 'all' as string,
  });

  useEffect(() => {
    loadUsers();
    loadOrders();
  }, [currentDate, filters]);

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
      const startDate = format(currentDate, 'yyyy-MM-dd');

      // Se filtro for 'all', buscar de todos os técnicos (passar 'all' como ID)
      const techId = filters.technicianId === 'all' ? 'all' : filters.technicianId;
      const data = await schedulingApi.getWeekSchedule(techId, startDate);

      let filtered = Array.isArray(data) ? data : [];
      if (filters.status !== 'all') {
        filtered = filtered.filter(o => o.status === filters.status);
      }

      setOrders(filtered);
    } catch (err: any) {
      showToast.error('Erro ao carregar agenda');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  const getOrdersForDate = (date: Date) => {
    return orders.filter(order => {
      const orderDate = parseISO(order.scheduledFor);
      return isSameDay(orderDate, date);
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-gray-500',
      scheduled: 'bg-blue-500',
      in_progress: 'bg-orange-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
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

  // Renderizar visualização mensal
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { locale: ptBR });
    const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/50">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7 auto-rows-fr min-h-[400px] sm:min-h-[600px]">
          {days.map((day, index) => {
            const dayOrders = getOrdersForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);

            return (
              <div
                key={index}
                className={`min-h-[60px] sm:min-h-[100px] p-1 sm:p-2 border-r border-b border-border transition-colors ${
                  !isCurrentMonth ? 'bg-muted/20' : 'bg-card hover:bg-muted/30'
                } ${isDayToday ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}
              >
                {/* Número do dia */}
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      !isCurrentMonth
                        ? 'text-muted-foreground'
                        : isDayToday
                        ? 'bg-blue-600 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs'
                        : 'text-foreground'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayOrders.length > 0 && (
                    <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
                      {dayOrders.length}
                    </span>
                  )}
                </div>

                {/* Lista de ordens */}
                <div className="space-y-0.5 sm:space-y-1">
                  {dayOrders.slice(0, 2).map((order) => (
                    <button
                      key={order.id}
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailsModal(true);
                      }}
                      className={`w-full text-left px-1 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs text-white truncate transition-all hover:scale-105 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      <span className="hidden sm:inline">{format(parseISO(order.scheduledFor), 'HH:mm')} - </span>
                      {order.customer.name.split(' ')[0]}
                    </button>
                  ))}
                  {dayOrders.length > 2 && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                      +{dayOrders.length - 2}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie seus agendamentos e ordens de serviço
          </p>
        </div>

        <button
          onClick={() => router.push('/dashboard/orders/new')}
          className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium w-full sm:w-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Nova Ordem
        </button>
      </div>

      {/* Controles */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Navegação de data */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 flex-1 justify-center sm:flex-initial sm:justify-start">
            <h2 className="text-lg sm:text-xl font-semibold text-center">
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs sm:text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Hoje
            </button>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros e visualizações */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors min-h-[44px] flex-1 sm:flex-initial justify-center"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filtros</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setViewMode('month')}
              className={`p-2 rounded min-h-[44px] min-w-[44px] flex items-center justify-center ${
                viewMode === 'month' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              } transition-colors`}
              title="Visualização Mensal"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`p-2 rounded min-h-[44px] min-w-[44px] flex items-center justify-center ${
                viewMode === 'week' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              } transition-colors`}
              title="Visualização Semanal"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`p-2 rounded min-h-[44px] min-w-[44px] flex items-center justify-center ${
                viewMode === 'day' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              } transition-colors`}
              title="Visualização Diária"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border border-border space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-semibold">Filtros</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Técnico</label>
              <select
                value={filters.technicianId}
                onChange={(e) => setFilters({ ...filters, technicianId: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-lg text-sm min-h-[44px]"
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
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-lg text-sm min-h-[44px]"
              >
                <option value="all">Todos</option>
                <option value="scheduled">Agendada</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluída</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Calendar View */}
      {!loading && viewMode === 'month' && renderMonthView()}

      {/* Placeholder para week e day views */}
      {!loading && viewMode === 'week' && (
        <div className="bg-card rounded-lg border border-border p-6 sm:p-12 text-center">
          <LayoutList className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">
            Visualização semanal em desenvolvimento
          </p>
        </div>
      )}

      {!loading && viewMode === 'day' && (
        <div className="bg-card rounded-lg border border-border p-6 sm:p-12 text-center">
          <CalendarIcon className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">
            Visualização diária em desenvolvimento
          </p>
        </div>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Detalhes da Ordem #{selectedOrder?.number}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 sm:space-y-6">
              {/* Status e Data */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {getStatusLabel(selectedOrder.status)}
                </Badge>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {format(parseISO(selectedOrder.scheduledFor), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </div>
              </div>

              {/* Cliente */}
              <div>
                <h4 className="text-sm sm:text-base font-semibold mb-2 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Cliente
                </h4>
                <p className="text-sm sm:text-base text-foreground font-medium">
                  {selectedOrder.customer.name}
                </p>
              </div>

              {/* Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h4 className="text-sm sm:text-base font-semibold mb-2">Serviços</h4>
                  <ul className="space-y-1">
                    {selectedOrder.items.map((item, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-muted-foreground">
                        • {item.description} (x{item.quantity})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => {
                    router.push(`/dashboard/orders/${selectedOrder.id}`);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors min-h-[44px]"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Ver Detalhes</span>
                </button>
                <button
                  onClick={() => {
                    router.push(`/dashboard/orders/${selectedOrder.id}/edit`);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors min-h-[44px]"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Editar</span>
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
