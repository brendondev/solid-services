'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { customerPortalApi, Quotation } from '@/lib/api/customer-portal';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

/**
 * Página de Detalhes do Orçamento - Portal do Cliente
 *
 * Permite visualizar e aprovar/rejeitar orçamentos
 */
export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadQuotation();
  }, [params.id]);

  const loadQuotation = async () => {
    try {
      const data = await customerPortalApi.getQuotation(params.id as string);
      setQuotation(data);
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error);
      toast.error('Erro ao carregar orçamento');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!quotation) return;

    if (!confirm('Deseja realmente aprovar este orçamento?')) return;

    setActionLoading(true);
    try {
      await customerPortalApi.approveQuotation(quotation.id);
      toast.success('Orçamento aprovado com sucesso!');
      loadQuotation();
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      toast.error('Erro ao aprovar orçamento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!quotation) return;

    if (!confirm('Deseja realmente rejeitar este orçamento?')) return;

    setActionLoading(true);
    try {
      await customerPortalApi.rejectQuotation(quotation.id);
      toast.success('Orçamento rejeitado');
      loadQuotation();
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      toast.error('Erro ao rejeitar orçamento');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          Orçamento não encontrado
        </h2>
      </div>
    );
  }

  const canApproveOrReject = quotation.status === 'sent';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {quotation.number}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Criado em {new Date(quotation.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <StatusBadge status={quotation.status} />
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Válido até
            </h3>
            <p className="text-base text-gray-900">
              {new Date(quotation.validUntil).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Valor Total
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              R${' '}
              {quotation.totalAmount.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {quotation.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Observações
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {quotation.notes}
            </p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Itens do Orçamento
          </h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Serviço
              </th>
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
            {quotation.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {item.service.name}
                  </div>
                </td>
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
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-6 py-4 text-right font-semibold text-gray-900">
                Total Geral:
              </td>
              <td className="px-6 py-4 text-right">
                <div className="text-lg font-bold text-gray-900">
                  R${' '}
                  {quotation.totalAmount.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Actions */}
      {canApproveOrReject && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ação Necessária
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Este orçamento está aguardando sua aprovação. Revise os itens e valores
            acima e escolha uma das ações abaixo.
          </p>
          <div className="flex space-x-4">
            <Button
              onClick={handleApprove}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              ✓ Aprovar Orçamento
            </Button>
            <Button
              onClick={handleReject}
              disabled={actionLoading}
              variant="secondary"
            >
              ✗ Rejeitar Orçamento
            </Button>
          </div>
        </div>
      )}

      {quotation.status === 'approved' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            ✓ Orçamento Aprovado
          </h3>
          <p className="text-sm text-green-700">
            Este orçamento foi aprovado. Em breve uma ordem de serviço será criada
            e você poderá acompanhar o andamento na aba "Ordens em Andamento".
          </p>
        </div>
      )}

      {quotation.status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            ✗ Orçamento Rejeitado
          </h3>
          <p className="text-sm text-red-700">
            Este orçamento foi rejeitado. Entre em contato se desejar discutir
            ajustes ou um novo orçamento.
          </p>
        </div>
      )}

      {/* Back Button */}
      <div>
        <Button
          onClick={() => router.back()}
          variant="secondary"
        >
          ← Voltar
        </Button>
      </div>
    </div>
  );
}
