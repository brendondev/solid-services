'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ordersApi, ServiceOrder } from '@/lib/api/orders';

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
    if (!confirm(`Tem certeza que deseja mudar o status para "${getStatusLabel(status)}"?`)) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-gray-100 text-gray-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando ordem...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Ordem não encontrada'}
        </div>
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Voltar para ordens
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.number}</h1>
            <p className="text-gray-600">Ordem de Serviço</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      {/* Ações de Status */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3 flex-wrap">
        {order.status === 'open' && (
          <button
            onClick={() => handleStatusChange('scheduled')}
            disabled={actionLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            📅 Agendar
          </button>
        )}

        {(order.status === 'open' || order.status === 'scheduled') && (
          <button
            onClick={() => handleStatusChange('in_progress')}
            disabled={actionLoading}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            ▶️ Iniciar Execução
          </button>
        )}

        {order.status === 'in_progress' && (
          <button
            onClick={() => handleStatusChange('completed')}
            disabled={actionLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            ✅ Concluir
          </button>
        )}

        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <button
            onClick={() => handleStatusChange('cancelled')}
            disabled={actionLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            ❌ Cancelar
          </button>
        )}
      </div>

      {/* Informações Gerais */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informações Gerais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Número</label>
            <p className="text-gray-900 font-medium">{order.number}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Cliente</label>
            <p className="text-gray-900 font-medium">
              {order.customer?.name || '-'}
            </p>
          </div>
          {order.scheduledFor && (
            <div>
              <label className="text-sm text-gray-600">Agendado para</label>
              <p className="text-gray-900 font-medium">
                {new Date(order.scheduledFor).toLocaleString('pt-BR')}
              </p>
            </div>
          )}
          {order.assignedToUser && (
            <div>
              <label className="text-sm text-gray-600">Responsável</label>
              <p className="text-gray-900 font-medium">
                {order.assignedToUser.name}
              </p>
            </div>
          )}
          <div>
            <label className="text-sm text-gray-600">Criado em</label>
            <p className="text-gray-900 font-medium">
              {new Date(order.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          {order.completedAt && (
            <div>
              <label className="text-sm text-gray-600">Concluído em</label>
              <p className="text-gray-900 font-medium">
                {new Date(order.completedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </div>

        {order.notes && (
          <div className="mt-4">
            <label className="text-sm text-gray-600">Observações</label>
            <p className="text-gray-900 mt-1">{order.notes}</p>
          </div>
        )}
      </div>

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
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
          <button
            onClick={() => setShowTimelineModal(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={actionLoading}
          >
            + Adicionar Evento
          </button>
        </div>

        {order.timeline && order.timeline.length > 0 ? (
          <div className="space-y-4">
            {order.timeline.map((event) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 pb-4 border-l-2 border-gray-200 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{event.event}</p>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(event.createdAt).toLocaleString('pt-BR')} •{' '}
                        {event.user?.name || 'Sistema'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Nenhum evento registrado
          </p>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Checklist</h2>
          <button
            onClick={() => setShowChecklistModal(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={actionLoading}
          >
            + Adicionar Tarefa
          </button>
        </div>

        {order.checklists && order.checklists.length > 0 ? (
          <div className="space-y-2">
            {order.checklists.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded"
              >
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() =>
                    handleToggleChecklistItem(item.id, item.isCompleted)
                  }
                  disabled={actionLoading}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span
                  className={`flex-1 ${
                    item.isCompleted
                      ? 'line-through text-gray-500'
                      : 'text-gray-900'
                  }`}
                >
                  {item.description}
                </span>
                {item.completedAt && (
                  <span className="text-xs text-gray-500">
                    ✓ {new Date(item.completedAt).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Nenhuma tarefa adicionada</p>
        )}
      </div>

      {/* Modal Timeline */}
      {showTimelineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Adicionar Evento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evento *
                </label>
                <input
                  type="text"
                  value={timelineEvent}
                  onChange={(e) => setTimelineEvent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Detalhes adicionais..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowTimelineModal(false);
                    setTimelineEvent('');
                    setTimelineDescription('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddTimelineEvent}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={actionLoading}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Checklist */}
      {showChecklistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Adicionar Tarefa</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarefa *
                </label>
                <input
                  type="text"
                  value={checklistItem}
                  onChange={(e) => setChecklistItem(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Testar instalação elétrica"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowChecklistModal(false);
                    setChecklistItem('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddChecklistItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={actionLoading}
                >
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
