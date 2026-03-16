'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi, ServiceOrder } from '@/lib/api/orders';
import {
  Plus,
  ClipboardList,
  DollarSign,
  Eye,
  Trash2,
  Loader2,
  CheckCircle,
  Clock,
  PlayCircle,
  XCircle,
  Calendar,
  UserCircle
} from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = filter ? await ordersApi.findAll(filter) : await ordersApi.findAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar ordens');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ordem?')) {
      return;
    }

    try {
      await ordersApi.remove(id);
      await loadOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir ordem');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    open: {
      label: 'Aberta',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: Clock
    },
    scheduled: {
      label: 'Agendada',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Calendar
    },
    in_progress: {
      label: 'Em Andamento',
      color: 'bg-warning/10 text-warning border-warning/20',
      icon: PlayCircle
    },
    completed: {
      label: 'Concluída',
      color: 'bg-success/10 text-success border-success/20',
      icon: CheckCircle
    },
    cancelled: {
      label: 'Cancelada',
      color: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: XCircle
    },
  };

  const getStats = () => {
    const total = orders.length;
    const totalValue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const completed = orders.filter(o => o.status === 'completed').length;
    const inProgress = orders.filter(o => o.status === 'in_progress').length;

    return { total, totalValue, completed, inProgress };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
          <p className="text-muted-foreground mt-1">Gerencie as ordens de trabalho</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/orders/new')}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nova Ordem
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Ordens</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.totalValue)}
              </p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Concluídas</p>
              <p className="text-2xl font-bold text-success mt-1">{stats.completed}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold text-warning mt-1">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <PlayCircle className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-border">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white min-w-[200px]"
          >
            <option value="">Todos os status</option>
            <option value="open">Abertas</option>
            <option value="scheduled">Agendadas</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Concluídas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-border p-12 text-center">
          <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900 mb-2">Nenhuma ordem encontrada</p>
          <p className="text-muted-foreground mb-6">Comece criando sua primeira ordem de serviço</p>
          <button
            onClick={() => router.push('/dashboard/orders/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Criar Primeira Ordem
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => {
            const statusInfo = statusConfig[order.status];
            const StatusIcon = statusInfo?.icon || Clock;

            return (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {order.number}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusInfo?.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo?.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Cliente</p>
                        <p className="text-base font-medium text-gray-900">
                          {order.customer?.name || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Responsável</p>
                        <div className="flex items-center gap-2 mt-1">
                          <UserCircle className="w-4 h-4 text-muted-foreground" />
                          <p className="text-base font-medium text-gray-900">
                            {order.assignedUser?.name || 'Não atribuído'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Agendamento</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <p className="text-base font-medium text-gray-900">
                            {order.scheduledFor
                              ? new Date(order.scheduledFor).toLocaleDateString('pt-BR')
                              : 'Não agendado'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Total</p>
                        <p className="text-base font-bold text-success">
                          {formatCurrency(Number(order.totalAmount))}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
