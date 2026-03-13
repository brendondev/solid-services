'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { customerPortalApi, Quotation, ServiceOrder } from '@/lib/api/customer-portal';
import { StatusBadge } from '@/components/ui/Badge';

/**
 * Dashboard do Portal do Cliente
 *
 * Visão geral de orçamentos e ordens
 */
export default function CustomerDashboardPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [quotationsData, ordersData] = await Promise.all([
        customerPortalApi.getQuotations(),
        customerPortalApi.getOrders(),
      ]);

      setQuotations(quotationsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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

  const pendingQuotations = quotations.filter((q) => q.status === 'sent');
  const activeOrders = orders.filter((o) => ['open', 'scheduled', 'in_progress'].includes(o.status));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bem-vindo!</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <span className="text-2xl">📄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Orçamentos Pendentes
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {pendingQuotations.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <span className="text-2xl">🔧</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Ordens em Andamento
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {activeOrders.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Serviços Concluídos
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {orders.filter((o) => o.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Quotations */}
      {pendingQuotations.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Orçamentos Aguardando Aprovação
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingQuotations.slice(0, 3).map((quotation) => (
              <div key={quotation.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {quotation.number}
                    </p>
                    <p className="text-sm text-gray-600">
                      {quotation.items.length} item(s) - R${' '}
                      {quotation.totalAmount.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <Link
                    href={`/portal/quotations/${quotation.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Revisar →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {pendingQuotations.length > 3 && (
            <div className="px-6 py-3 bg-gray-50 text-center">
              <Link
                href="/portal/quotations"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todos os orçamentos
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Ordens em Andamento
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {activeOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <p className="text-sm font-medium text-gray-900">
                        {order.number}
                      </p>
                      <StatusBadge status={order.status} />
                    </div>
                    {order.scheduledFor && (
                      <p className="text-sm text-gray-600 mt-1">
                        Agendado para:{' '}
                        {new Date(order.scheduledFor).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/portal/orders/${order.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Ver detalhes →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {activeOrders.length > 3 && (
            <div className="px-6 py-3 bg-gray-50 text-center">
              <Link
                href="/portal/orders"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todas as ordens
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {pendingQuotations.length === 0 && activeOrders.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <span className="text-6xl mb-4 block">📭</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tudo em dia!
          </h3>
          <p className="text-gray-600">
            Você não tem orçamentos pendentes ou ordens em andamento no momento.
          </p>
        </div>
      )}
    </div>
  );
}
