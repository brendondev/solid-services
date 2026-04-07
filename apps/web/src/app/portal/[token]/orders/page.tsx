'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PortalLayout from '@/components/portal/PortalLayout';
import {
  validateToken,
  getOrders,
  type CustomerData,
  type ServiceOrder,
} from '@/lib/api/portal';
import { Package, Calendar, Clock } from 'lucide-react';

export default function OrdersPage() {
  const params = useParams();
  const token = params.token as string;

  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('active');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [customerData, ordersData] = await Promise.all([
          validateToken(),
          getOrders(),
        ]);
        setCustomer(customerData);
        setOrders(ordersData);
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active')
      return o.status === 'scheduled' || o.status === 'in_progress';
    if (filter === 'completed') return o.status === 'completed';
    if (filter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  if (loading) {
    return (
      <PortalLayout customerName="" customerId="" token={token}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout customerName={customer?.name} customerId={customer?.id} token={token}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Minhas Ordens de Serviço
            </h2>
            <p className="text-gray-600 mt-1">
              Acompanhe o andamento dos serviços
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Em Andamento (
              {
                orders.filter(
                  (o) => o.status === 'scheduled' || o.status === 'in_progress'
                ).length
              }
              )
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Concluídas (
              {orders.filter((o) => o.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({orders.length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma ordem encontrada
            </h3>
            <p className="text-gray-600">
              {filter === 'active'
                ? 'Você não tem ordens em andamento no momento.'
                : filter === 'completed'
                ? 'Você ainda não tem ordens concluídas.'
                : 'Você ainda não tem ordens de serviço.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <Link
                key={order.id}
                href={`/portal/${token}/orders/${order.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        OS #{order.number}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    {order.scheduledFor && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Agendado para:{' '}
                          {new Date(order.scheduledFor).toLocaleDateString(
                            'pt-BR'
                          )}{' '}
                          às{' '}
                          {new Date(order.scheduledFor).toLocaleTimeString(
                            'pt-BR',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </span>
                      </div>
                    )}

                    {order.completedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          Concluído em:{' '}
                          {new Date(order.completedAt).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                      </div>
                    )}

                    {order.observations && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {order.observations}
                      </p>
                    )}

                    {/* Timeline preview */}
                    {order.timeline && order.timeline.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">
                          Último evento:
                        </p>
                        <p className="text-sm text-gray-700">
                          {order.timeline[0].event}
                          {order.timeline[0].description &&
                            ` - ${order.timeline[0].description}`}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                      Ver Detalhes
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    scheduled: 'Agendado',
    in_progress: 'Em Andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
  };
  return labels[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
