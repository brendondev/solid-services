'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { customerPortalApi, ServiceOrder } from '@/lib/api/customer-portal';
import { StatusBadge } from '@/components/ui/badge';

/**
 * Página de Ordens em Andamento - Portal do Cliente
 *
 * Lista todas as ordens de serviço ativas
 */
export default function PortalOrdersPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await customerPortalApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Erro ao carregar ordens:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = orders.filter((o) =>
    ['open', 'scheduled', 'in_progress'].includes(o.status)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ordens em Andamento</h1>
      </div>

      {/* Orders List */}
      {activeOrders.length > 0 ? (
        <div className="space-y-4">
          {activeOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {order.number}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Criado em {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {order.scheduledFor && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">
                    📅 Agendado para:{' '}
                    <span className="font-semibold">
                      {new Date(order.scheduledFor).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(order.scheduledFor).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {order.items.length} serviço(s) - Valor: R${' '}
                  {order.totalAmount.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              {/* Timeline preview */}
              {order.timeline.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    ÚLTIMAS ATUALIZAÇÕES
                  </p>
                  <div className="space-y-2">
                    {order.timeline.slice(0, 2).map((event) => (
                      <div key={event.id} className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{event.event}</p>
                          <p className="text-xs text-gray-500">
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
                </div>
              )}

              <div className="text-right">
                <Link
                  href={`/portal/orders/${order.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver todos os detalhes →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <span className="text-6xl mb-4 block">🔧</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma ordem em andamento
          </h3>
          <p className="text-gray-600">
            Você não tem ordens de serviço ativas no momento.
          </p>
        </div>
      )}
    </div>
  );
}
