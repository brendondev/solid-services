'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PortalLayout from '@/components/portal/PortalLayout';
import {
  validateToken,
  getServiceHistory,
  type CustomerData,
  type ServiceHistory,
} from '@/lib/api/portal';
import { CheckCircle, Calendar } from 'lucide-react';

export default function HistoryPage() {
  const params = useParams();
  const token = params.token as string;

  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [history, setHistory] = useState<ServiceHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [customerData, historyData] = await Promise.all([
          validateToken(),
          getServiceHistory(),
        ]);
        setCustomer(customerData);
        setHistory(historyData);
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Histórico de Serviços
          </h2>
          <p className="text-gray-600 mt-1">
            Últimos {history.length} serviços completados
          </p>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum serviço completado ainda
            </h3>
            <p className="text-gray-600">
              Seu histórico de serviços completados aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      OS #{service.number}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Concluído em:{' '}
                        {new Date(service.completedAt).toLocaleDateString(
                          'pt-BR'
                        )}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Concluído
                  </span>
                </div>

                {/* Services List */}
                {service.items && service.items.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Serviços realizados:
                    </h4>
                    <ul className="space-y-2">
                      {service.items.map((item) => (
                        <li
                          key={item.id}
                          className="text-sm text-gray-600 flex items-start gap-2"
                        >
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>
                            {item.description || `Serviço #${item.serviceId}`}
                            {item.quantity > 1 && ` (x${item.quantity})`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {history.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Resumo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-700">Total de Serviços</p>
                <p className="text-2xl font-bold text-blue-900">
                  {history.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Primeiro Serviço</p>
                <p className="text-lg font-semibold text-blue-900">
                  {new Date(
                    history[history.length - 1].completedAt
                  ).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Último Serviço</p>
                <p className="text-lg font-semibold text-blue-900">
                  {new Date(history[0].completedAt).toLocaleDateString(
                    'pt-BR'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
