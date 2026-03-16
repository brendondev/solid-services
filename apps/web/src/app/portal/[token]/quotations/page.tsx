'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PortalLayout from '@/components/portal/PortalLayout';
import {
  validateToken,
  getQuotations,
  type CustomerData,
  type Quotation,
} from '@/lib/api/portal';
import { FileText, Calendar, DollarSign } from 'lucide-react';

export default function QuotationsPage() {
  const params = useParams();
  const token = params.token as string;

  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [customerData, quotationsData] = await Promise.all([
          validateToken(),
          getQuotations(),
        ]);
        setCustomer(customerData);
        setQuotations(quotationsData);
      } catch (err) {
        console.error('Error loading quotations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const filteredQuotations = quotations.filter((q) => {
    if (filter === 'pending') return q.status === 'sent';
    if (filter === 'approved') return q.status === 'approved';
    if (filter === 'rejected') return q.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <PortalLayout customerName="" token={token}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout customerName={customer?.name} token={token}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Meus Orçamentos
            </h2>
            <p className="text-gray-600 mt-1">
              Visualize e responda aos orçamentos recebidos
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({quotations.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes (
              {quotations.filter((q) => q.status === 'sent').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Aprovados (
              {quotations.filter((q) => q.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejeitados (
              {quotations.filter((q) => q.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Quotations List */}
        {filteredQuotations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum orçamento encontrado
            </h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'Você ainda não recebeu orçamentos.'
                : `Você não tem orçamentos ${
                    filter === 'pending'
                      ? 'pendentes'
                      : filter === 'approved'
                      ? 'aprovados'
                      : 'rejeitados'
                  }.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredQuotations.map((quotation) => (
              <Link
                key={quotation.id}
                href={`/portal/${token}/quotations/${quotation.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Orçamento #{quotation.number}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          quotation.status === 'sent'
                            ? 'bg-yellow-100 text-yellow-800'
                            : quotation.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : quotation.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {getStatusLabel(quotation.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          Valor: R$ {quotation.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Válido até:{' '}
                          {new Date(quotation.validUntil).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                      </div>
                    </div>

                    {quotation.observations && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {quotation.observations}
                      </p>
                    )}
                  </div>

                  {quotation.status === 'sent' && (
                    <div className="ml-4">
                      <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                        Responder
                      </span>
                    </div>
                  )}
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
    draft: 'Rascunho',
    sent: 'Aguardando Resposta',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    expired: 'Expirado',
  };
  return labels[status] || status;
}
