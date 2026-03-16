'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ordersApi, ServiceOrder } from '@/lib/api/orders';
import {
  ArrowLeft,
  Calendar,
  PlayCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  DollarSign,
  Package,
  Loader2,
  Plus,
  Square,
  CheckSquare
} from 'lucide-react';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Estados para modals
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [timelineEvent, setTimelineEvent] = useState('');
  const [timelineDescription, setTimelineDescription] = useState('');
  const [checklistItem, setChecklistItem] = useState('');

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await ordersApi.findOne(id);
      setOrder(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar ordem');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    const statusLabel = statusConfig[status]?.label || status;
    if (!confirm(`Tem certeza que deseja mudar o status para "${statusLabel}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await ordersApi.update(id, { status: status as any });
      await loadOrder();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTimelineEvent = async () => {
    if (!timelineEvent.trim()) {
      alert('Digite um evento');
      return;
    }

    try {
      setActionLoading(true);
      await ordersApi.addTimelineEvent(id, timelineEvent, timelineDescription || undefined);
      setTimelineEvent('');
      setTimelineDescription('');
      setShowTimelineModal(false);
      await loadOrder();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao adicionar evento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddChecklistItem = async () => {
    if (!checklistItem.trim()) {
      alert('Digite uma tarefa');
      return;
    }

    try {
      setActionLoading(true);
      await ordersApi.addChecklistItem(id, checklistItem);
      setChecklistItem('');
      setShowChecklistModal(false);
      await loadOrder();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao adicionar tarefa');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleChecklistItem = async (checklistId: string, isCompleted: boolean) => {
    try {
      setActionLoading(true);
      if (isCompleted) {
        await ordersApi.uncompleteChecklistItem(id, checklistId);
      } else {
        await ordersApi.completeChecklistItem(id, checklistId);
      }
      await loadOrder();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar tarefa');
    } finally {
      setActionLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error || 'Ordem não encontrada'}
        </div>
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="text-primary hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para ordens
        </button>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status];
  const StatusIcon = statusInfo?.icon || Clock;

  return (
    <div className="space-y-6 pb-24 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Ordem {order.number}
            </h1>
            <p className="text-muted-foreground mt-1">
              Detalhes e execução da ordem de serviço
            </p>
          </div>
        </div>
        <div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 ${statusInfo?.color}`}>
            <StatusIcon className="w-4 h-4" />
            {statusInfo?.label}
          </span>
        </div>
      </div>

      {/* Ações de Status */}
      <div className="bg-white p-4 rounded-lg shadow border border-border flex items-center gap-3 flex-wrap">
        {order.status === 'open' && (
          <button
            onClick={() => handleStatusChange('scheduled')}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            Agendar
          </button>
        )}

        {(order.status === 'open' || order.status === 'scheduled') && (
          <button
            onClick={() => handleStatusChange('in_progress')}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-warning text-warning-foreground rounded-lg hover:bg-warning/90 transition-colors disabled:opacity-50 font-medium"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            Iniciar Execução
          </button>
        )}

        {order.status === 'in_progress' && (
          <button
            onClick={() => handleStatusChange('completed')}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50 font-medium"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Concluir
          </button>
        )}

        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <button
            onClick={() => handleStatusChange('cancelled')}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 font-medium"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Cancelar
          </button>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="text-lg font-semibold text-gray-900">
                {order.customer?.name || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(Number(order.totalAmount))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Calendar className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Agendamento</p>
              <p className="text-lg font-semibold text-gray-900">
                {order.scheduledFor ? new Date(order.scheduledFor).toLocaleDateString('pt-BR') : 'Não agendado'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent rounded-lg">
              <Package className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Itens</p>
              <p className="text-lg font-semibold text-gray-900">
                {order.items?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Observações */}
      {order.notes && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Observações</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
        </div>
      )}

      {/* Serviços */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Serviços</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Descrição
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Qtd
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Preço Unit.
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Nenhum serviço
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t flex justify-end">
          <div className="text-right">
            <span className="text-sm text-gray-600">Valor Total: </span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white p-6 rounded-lg shadow border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Timeline de Eventos</h2>
          <button
            onClick={() => setShowTimelineModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            disabled={actionLoading}
          >
            <Plus className="w-4 h-4" />
            Adicionar Evento
          </button>
        </div>

        {order.timeline && order.timeline.length > 0 ? (
          <div className="space-y-4">
            {order.timeline.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex-shrink-0 w-3 h-3 mt-2 bg-primary rounded-full"></div>
                <div className={`flex-1 pb-4 ${index < (order.timeline?.length || 0) - 1 ? 'border-l-2 border-border' : ''} pl-4`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{event.event}</p>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString('pt-BR')}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <User className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {event.user?.name || 'Sistema'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Nenhum evento registrado</p>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-white p-6 rounded-lg shadow border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Checklist de Tarefas</h2>
          <button
            onClick={() => setShowChecklistModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            disabled={actionLoading}
          >
            <Plus className="w-4 h-4" />
            Adicionar Tarefa
          </button>
        </div>

        {order.checklists && order.checklists.length > 0 ? (
          <div className="space-y-2">
            {order.checklists.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg border border-border transition-colors"
              >
                <button
                  onClick={() => handleToggleChecklistItem(item.id, item.isCompleted)}
                  disabled={actionLoading}
                  className="flex-shrink-0"
                >
                  {item.isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-success" />
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                <span
                  className={`flex-1 ${
                    item.isCompleted
                      ? 'line-through text-muted-foreground'
                      : 'text-gray-900 font-medium'
                  }`}
                >
                  {item.description}
                </span>
                {item.completedAt && (
                  <div className="flex items-center gap-1 text-xs text-success">
                    <CheckCircle className="w-3 h-3" />
                    <span>{new Date(item.completedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Nenhuma tarefa adicionada</p>
          </div>
        )}
      </div>

      {/* Modal Timeline */}
      {showTimelineModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 animate-scaleIn">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Adicionar Evento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evento *
                </label>
                <input
                  type="text"
                  value={timelineEvent}
                  onChange={(e) => setTimelineEvent(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Chegada no local"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={timelineDescription}
                  onChange={(e) => setTimelineDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Detalhes adicionais..."
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    setShowTimelineModal(false);
                    setTimelineEvent('');
                    setTimelineDescription('');
                  }}
                  className="px-4 py-2 border border-border text-gray-700 rounded-lg hover:bg-muted transition-colors"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddTimelineEvent}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Checklist */}
      {showChecklistModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 animate-scaleIn">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Adicionar Tarefa</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarefa *
                </label>
                <input
                  type="text"
                  value={checklistItem}
                  onChange={(e) => setChecklistItem(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Testar instalação elétrica"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    setShowChecklistModal(false);
                    setChecklistItem('');
                  }}
                  className="px-4 py-2 border border-border text-gray-700 rounded-lg hover:bg-muted transition-colors"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddChecklistItem}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
