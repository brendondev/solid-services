'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { quotationsApi, Quotation } from '@/lib/api/quotations';
import { ordersApi } from '@/lib/api/orders';

export default function QuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuotation();
    }
  }, [id]);

  const loadQuotation = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await quotationsApi.findOne(id);
      setQuotation(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar orçamento');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: 'sent' | 'approved' | 'rejected') => {
    if (!confirm(`Tem certeza que deseja marcar como "${getStatusLabel(status)}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await quotationsApi.updateStatus(id, status);
      await loadQuotation();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!confirm('Deseja criar uma ordem de serviço a partir deste orçamento?')) {
      return;
    }

    try {
      setActionLoading(true);
      const order = await ordersApi.createFromQuotation(id);
      router.push(`/dashboard/orders/${order.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar ordem de serviço');
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!quotation) return;

    try {
      setActionLoading(true);
      await quotationsApi.downloadPdf(id, quotation.number);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao gerar PDF');
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
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'sent':
        return 'bg-blue-100 text-blue-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Rascunho',
      sent: 'Enviado',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando orçamento...</div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Orçamento não encontrado'}
        </div>
        <button
          onClick={() => router.push('/dashboard/quotations')}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Voltar para orçamentos
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
            onClick={() => router.push('/dashboard/quotations')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {quotation.number}
            </h1>
            <p className="text-gray-600">Orçamento</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quotation.status)}`}>
          {getStatusLabel(quotation.status)}
        </span>
      </div>

      {/* Ações */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3 flex-wrap">
        {/* Botão de Download PDF - sempre disponível */}
        <button
          onClick={handleDownloadPdf}
          disabled={actionLoading}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Baixar PDF
        </button>

        {quotation.status === 'draft' && (
          <button
            onClick={() => handleStatusChange('sent')}
            disabled={actionLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            📤 Enviar para Cliente
          </button>
        )}

        {quotation.status === 'sent' && (
          <>
            <button
              onClick={() => handleStatusChange('approved')}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              ✅ Aprovar
            </button>
            <button
              onClick={() => handleStatusChange('rejected')}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              ❌ Rejeitar
            </button>
          </>
        )}

        {quotation.status === 'approved' && (
          <button
            onClick={handleCreateOrder}
            disabled={actionLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            📋 Criar Ordem de Serviço
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
            <p className="text-gray-900 font-medium">{quotation.number}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Cliente</label>
            <p className="text-gray-900 font-medium">
              {quotation.customer?.name || '-'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Data de Criação</label>
            <p className="text-gray-900 font-medium">
              {new Date(quotation.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          {quotation.validUntil && (
            <div>
              <label className="text-sm text-gray-600">Válido até</label>
              <p className="text-gray-900 font-medium">
                {new Date(quotation.validUntil).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </div>

        {quotation.notes && (
          <div className="mt-4">
            <label className="text-sm text-gray-600">Observações</label>
            <p className="text-gray-900 mt-1">{quotation.notes}</p>
          </div>
        )}
      </div>

      {/* Itens do Orçamento */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Itens do Orçamento
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Serviço
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
              {quotation.items && quotation.items.length > 0 ? (
                quotation.items.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {item.service?.name || '-'}
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
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Nenhum item no orçamento
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">
            Valor Total do Orçamento
          </span>
          <span className="text-3xl font-bold text-blue-600">
            {formatCurrency(quotation.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
