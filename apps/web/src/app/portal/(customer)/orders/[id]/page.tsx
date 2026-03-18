'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { customerPortalApi, ServiceOrder } from '@/lib/api/customer-portal';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Página de Detalhes da Ordem - Portal do Cliente
 *
 * Visualização completa da ordem de serviço
 */
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const loadOrder = async () => {
    try {
      const data = await customerPortalApi.getOrder(params.id as string);
      setOrder(data);
    } catch (error) {
      console.error('Erro ao carregar ordem:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          Ordem não encontrada
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.number}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Criado em {new Date(order.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {order.scheduledFor && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Agendado para
              </h3>
              <p className="text-base text-gray-900">
                {new Date(order.scheduledFor).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(order.scheduledFor).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Valor Total</h3>
            <p className="text-2xl font-bold text-gray-900">
              R${' '}
              {order.totalAmount.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          {order.completedAt && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Concluído em
              </h3>
              <p className="text-base text-gray-900">
                {new Date(order.completedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Serviços</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Unitário
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{item.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    R${' '}
                    {item.unitPrice.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    R${' '}
                    {item.total.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Histórico de Atualizações
        </h2>
        {order.timeline.length > 0 ? (
          <div className="space-y-4">
            {order.timeline.map((event, index) => (
              <div key={event.id} className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div
                    className={`flex-shrink-0 w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-600' : 'bg-gray-400'
                    }`}
                  ></div>
                  {index < order.timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium text-gray-900">
                    {event.event}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {event.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(event.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(event.createdAt).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Nenhuma atualização ainda.</p>
        )}
      </div>

      {/* Back Button */}
      <div>
        <Button onClick={() => router.back()} variant="secondary">
          ← Voltar
        </Button>
      </div>
    </div>
  );
}
