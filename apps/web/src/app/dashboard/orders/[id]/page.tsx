'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ordersApi, ServiceOrder } from '@/lib/api/orders';
import { AttachmentsSection } from '@/components/orders/AttachmentsSection';
import SignDocumentButton from '@/components/digital-signature/SignDocumentButton';
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
  CheckSquare,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { showToast } from '@/lib/toast';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Estados para modals
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [timelineEvent, setTimelineEvent] = useState('');
  const [timelineDescription, setTimelineDescription] = useState('');
  const [checklistItem, setChecklistItem] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteErrorLinks, setDeleteErrorLinks] = useState<any[]>([]);

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
      const errorMessage = err.response?.data?.message || 'Erro ao carregar ordem';
      setError(errorMessage);
      showToast.error(errorMessage);
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
      showToast.success('Status atualizado com sucesso');
      await loadOrder();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar status';
      showToast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTimelineEvent = async () => {
    if (!timelineEvent.trim()) {
      showToast.error('Digite um evento');
      return;
    }

    try {
      setActionLoading(true);
      await ordersApi.addTimelineEvent(id, timelineEvent, timelineDescription || undefined);
      setTimelineEvent('');
      setTimelineDescription('');
      setShowTimelineModal(false);
      showToast.success('Evento adicionado com sucesso');
      await loadOrder();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao adicionar evento';
      showToast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddChecklistItem = async () => {
    if (!checklistItem.trim()) {
      showToast.error('Digite uma tarefa');
      return;
    }

    try {
      setActionLoading(true);
      await ordersApi.addChecklistItem(id, checklistItem);
      setChecklistItem('');
      setShowChecklistModal(false);
      showToast.success('Tarefa adicionada com sucesso');
      await loadOrder();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao adicionar tarefa';
      showToast.error(errorMessage);
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
      showToast.success('Tarefa atualizada com sucesso');
      await loadOrder();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar tarefa';
      showToast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      setDeleteError('Por favor, informe o motivo da exclusão');
      showToast.error('Por favor, informe o motivo da exclusão');
      return;
    }

    try {
      setActionLoading(true);
      setDeleteError('');
      setDeleteErrorLinks([]);
      await ordersApi.remove(id, deleteReason);
      showToast.success('Ordem de serviço excluída com sucesso');
      router.push('/dashboard/orders');
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMessage = typeof errorData === 'string'
        ? errorData
        : errorData?.message || 'Erro ao excluir ordem';

      setDeleteError(errorMessage);
      showToast.error(errorMessage);

      // Capturar links de entidades vinculadas
      if (errorData?.links && Array.isArray(errorData.links)) {
        setDeleteErrorLinks(errorData.links);
      }

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
      color: 'bg-muted text-muted-foreground border-border',
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
      <div className="space-y-4">
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
    <div className="space-y-4 sm:space-y-4 p-4 sm:p-6 pb-24 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground active:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 sm:flex-none">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              Ordem {order.number}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Detalhes e execução da ordem de serviço
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <>
              <button
                onClick={() => router.push(`/dashboard/orders/${order.id}/edit`)}
                className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors font-medium shadow-sm"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 active:bg-destructive/80 transition-colors font-medium shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            </>
          )}
          <span className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium border flex items-center justify-center gap-2 ${statusInfo?.color}`}>
            <StatusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{statusInfo?.label}</span>
            <span className="sm:hidden">{statusInfo?.label.split(' ')[0]}</span>
          </span>
        </div>
      </div>

      {/* Ações de Status */}
      <div className="bg-card p-3 sm:p-4 rounded-lg shadow border border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        {order.status === 'open' && (
          <button
            onClick={() => handleStatusChange('scheduled')}
            disabled={actionLoading}
            className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-50 font-medium"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
            <span>Agendar</span>
          </button>
        )}

        {(order.status === 'open' || order.status === 'scheduled') && (
          <button
            onClick={() => handleStatusChange('in_progress')}
            disabled={actionLoading}
            className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 bg-warning text-warning-foreground rounded-lg hover:bg-warning/90 active:bg-warning/80 transition-colors disabled:opacity-50 font-medium"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
            <span className="hidden sm:inline">Iniciar Execução</span>
            <span className="sm:hidden">Iniciar</span>
          </button>
        )}

        {order.status === 'in_progress' && (
          <button
            onClick={() => handleStatusChange('completed')}
            disabled={actionLoading}
            className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 active:bg-success/80 transition-colors disabled:opacity-50 font-medium"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
            <span>Concluir</span>
          </button>
        )}

        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <button
            onClick={() => handleStatusChange('cancelled')}
            disabled={actionLoading}
            className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 active:bg-destructive/80 transition-colors disabled:opacity-50 font-medium"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
            <span>Cancelar</span>
          </button>
        )}
      </div>

      {/* Assinatura Digital */}
      <div className="bg-card p-3 sm:p-4 rounded-lg shadow border border-border">
        <SignDocumentButton
          documentType="order"
          documentId={order.id}
          documentNumber={order.number}
          isSigned={!!order.signedAt}
          signedAt={order.signedAt}
          signedBy={order.signedBy}
          signedDocumentUrl={order.signedDocumentUrl}
          onSignSuccess={loadOrder}
        />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg flex-shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Cliente</p>
              {order.customer ? (
                <button
                  onClick={() => router.push(`/dashboard/customers/${order.customerId}`)}
                  className="text-sm sm:text-base lg:text-lg font-semibold text-primary hover:text-primary/80 hover:underline transition-colors truncate block w-full text-left"
                >
                  {order.customer.name}
                </button>
              ) : (
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">N/A</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-success/10 rounded-lg flex-shrink-0">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Valor Total</p>
              <p className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">
                {formatCurrency(Number(order.totalAmount))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-warning/10 rounded-lg flex-shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Agendamento</p>
              <p className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">
                {order.scheduledFor ? new Date(order.scheduledFor).toLocaleDateString('pt-BR') : 'Não agendado'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-accent rounded-lg flex-shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Itens</p>
              <p className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">
                {order.items?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Observações */}
      {order.notes && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 sm:p-6 rounded-lg">
          <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">Observações</h3>
          <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
        </div>
      )}

      {/* Serviços */}
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Serviços</h2>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead className="bg-muted border-b">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                    Descrição
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                    Qtd
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                    Preço Unit.
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-foreground">
                        {item.description}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-foreground text-right whitespace-nowrap">
                        {item.quantity}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-foreground text-right whitespace-nowrap">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-foreground text-right whitespace-nowrap">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 sm:px-4 py-8 text-center text-sm text-muted-foreground">
                      Nenhum serviço
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-xs sm:text-sm text-muted-foreground sm:hidden">
            Deslize para ver mais →
          </div>
          <div className="text-right ml-auto">
            <span className="text-xs sm:text-sm text-muted-foreground">Valor Total: </span>
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground">Timeline de Eventos</h2>
          <button
            onClick={() => setShowTimelineModal(true)}
            className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors font-medium"
            disabled={actionLoading}
          >
            <Plus className="w-4 h-4" />
            <span className="sm:inline">Adicionar Evento</span>
          </button>
        </div>

        {order.timeline && order.timeline.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {order.timeline.map((event, index) => (
              <div key={event.id} className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-2 sm:w-3 h-2 sm:h-3 mt-2 bg-primary rounded-full"></div>
                <div className={`flex-1 pb-3 sm:pb-4 ${index < (order.timeline?.length || 0) - 1 ? 'border-l-2 border-border' : ''} pl-3 sm:pl-4`}>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-semibold text-foreground">{event.event}</p>
                      {event.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                        <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString('pt-BR')}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
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
          <div className="text-center py-8 sm:py-12">
            <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm sm:text-base text-muted-foreground">Nenhum evento registrado</p>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground">Checklist de Tarefas</h2>
          <button
            onClick={() => setShowChecklistModal(true)}
            className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors font-medium"
            disabled={actionLoading}
          >
            <Plus className="w-4 h-4" />
            <span className="sm:inline">Adicionar Tarefa</span>
          </button>
        </div>

        {order.checklists && order.checklists.length > 0 ? (
          <div className="space-y-2">
            {order.checklists.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/50 rounded-lg border border-border transition-colors min-h-[56px]"
              >
                <button
                  onClick={() => handleToggleChecklistItem(item.id, item.isCompleted)}
                  disabled={actionLoading}
                  className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
                >
                  {item.isCompleted ? (
                    <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                  ) : (
                    <Square className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                  )}
                </button>
                <span
                  className={`flex-1 text-sm sm:text-base ${
                    item.isCompleted
                      ? 'line-through text-muted-foreground'
                      : 'text-foreground font-medium'
                  }`}
                >
                  {item.title}
                </span>
                {item.completedAt && (
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-success flex-shrink-0">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{new Date(item.completedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <CheckSquare className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm sm:text-base text-muted-foreground">Nenhuma tarefa adicionada</p>
          </div>
        )}
      </div>

      {/* Modal Timeline */}
      {showTimelineModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full animate-scaleIn">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">Adicionar Evento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Evento *
                </label>
                <input
                  type="text"
                  value={timelineEvent}
                  onChange={(e) => setTimelineEvent(e.target.value)}
                  className="w-full h-11 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base sm:text-sm"
                  placeholder="Ex: Chegada no local"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Descrição
                </label>
                <textarea
                  value={timelineDescription}
                  onChange={(e) => setTimelineDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base sm:text-sm resize-none"
                  placeholder="Detalhes adicionais..."
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    setShowTimelineModal(false);
                    setTimelineEvent('');
                    setTimelineDescription('');
                  }}
                  className="min-h-[44px] px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted active:bg-muted/80 transition-colors"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddTimelineEvent}
                  className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full animate-scaleIn">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">Adicionar Tarefa</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Tarefa *
                </label>
                <input
                  type="text"
                  value={checklistItem}
                  onChange={(e) => setChecklistItem(e.target.value)}
                  className="w-full h-11 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base sm:text-sm"
                  placeholder="Ex: Testar instalação elétrica"
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    setShowChecklistModal(false);
                    setChecklistItem('');
                  }}
                  className="min-h-[44px] px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted active:bg-muted/80 transition-colors"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddChecklistItem}
                  className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-50"
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

      {/* Modal de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full animate-scaleIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 sm:p-3 bg-destructive/10 rounded-lg flex-shrink-0">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground">Excluir Ordem de Serviço</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-destructive/5 border border-destructive/20 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-foreground">
                  Você está prestes a excluir a ordem <strong>{order.number}</strong>.
                </p>
              </div>

              {deleteError && !deleteErrorLinks.length && (
                <div className="bg-destructive/10 border border-destructive/20 px-3 sm:px-4 py-3 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-destructive">{deleteError}</p>
                </div>
              )}

              {deleteErrorLinks.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-medium text-destructive mb-3">
                    {deleteError}
                  </p>
                  <p className="text-xs sm:text-sm text-foreground mb-3">
                    Este registro possui vínculos com:
                  </p>
                  <div className="space-y-2">
                    {deleteErrorLinks.map((link: any) => (
                      <button
                        key={link.id}
                        onClick={() => {
                          setShowDeleteModal(false);
                          const routes: Record<string, string> = {
                            receivable: '/dashboard/financial/receivables',
                            payable: '/dashboard/payables',
                            quotation: '/dashboard/quotations',
                            order: '/dashboard/orders',
                          };
                          const route = routes[link.type] || '/dashboard';
                          router.push(`${route}/${link.id}`);
                        }}
                        className="flex items-center gap-2 w-full min-h-[44px] px-3 py-2 bg-card border border-destructive/20 rounded hover:bg-destructive/5 active:bg-destructive/10 transition-colors text-left"
                      >
                        <span className="text-xs sm:text-sm text-foreground flex-1">{link.label}</span>
                        <span className="text-xs text-primary flex-shrink-0">Ver →</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Remova ou desvincule estes itens antes de excluir
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Motivo da exclusão *
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-destructive text-base sm:text-sm resize-none"
                  placeholder="Informe o motivo para fins de auditoria..."
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Este motivo será registrado nos logs de auditoria
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteReason('');
                  }}
                  className="min-h-[44px] px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted active:bg-muted/80 transition-colors"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 active:bg-destructive/80 transition-colors disabled:opacity-50"
                  disabled={actionLoading || !deleteReason.trim()}
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Confirmar Exclusão</span>
                  <span className="sm:hidden">Confirmar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attachments */}
      <AttachmentsSection
        orderId={id}
        attachments={order.attachments || []}
        onAttachmentsChange={loadOrder}
      />
    </div>
  );
}
