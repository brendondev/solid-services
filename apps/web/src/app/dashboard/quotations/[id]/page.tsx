'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { quotationsApi, Quotation } from '@/lib/api/quotations';
import { ordersApi } from '@/lib/api/orders';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Mail,
  Download,
  ArrowRight,
  Loader2,
  User,
  DollarSign,
  Calendar,
  Package
} from 'lucide-react';
import { showToast } from '@/lib/toast';
import SignDocumentButton from '@/components/digital-signature/SignDocumentButton';

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  draft: 'Rascunho',
  sent: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
};

export default function QuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
      const errorMessage = err.response?.data?.message || 'Erro ao carregar orçamento';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!quotation) return;
    try {
      setActionLoading('approve');
      await quotationsApi.updateStatus(quotation.id, 'approved');
      showToast.success('Orçamento aprovado com sucesso');
      await loadQuotation();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao aprovar orçamento';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!quotation) return;
    try {
      setActionLoading('reject');
      await quotationsApi.updateStatus(quotation.id, 'rejected');
      showToast.success('Orçamento rejeitado');
      await loadQuotation();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao rejeitar orçamento';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendEmail = async () => {
    if (!quotation) return;
    try {
      setActionLoading('email');
      await quotationsApi.updateStatus(quotation.id, 'sent');
      showToast.success('Orçamento marcado como enviado');
      await loadQuotation();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao enviar orçamento';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!quotation) return;
    try {
      setActionLoading('pdf');
      await quotationsApi.downloadPdf(id, quotation.number);
      showToast.success('PDF gerado com sucesso');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao gerar PDF';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConvertToOrder = async () => {
    if (!quotation) return;

    // Se já foi convertido, redirecionar para a OS
    if (quotation.serviceOrder) {
      router.push(`/dashboard/orders/${quotation.serviceOrder.id}`);
      return;
    }

    // Se não foi convertido, criar nova OS
    try {
      setActionLoading('convert');
      const order = await ordersApi.createFromQuotation(id);
      showToast.success('Ordem de serviço criada com sucesso');
      router.push(`/dashboard/orders/${order.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao converter para ordem de serviço';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="space-y-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
          {error || 'Orçamento não encontrado'}
        </div>
        <button
          onClick={() => router.push('/dashboard/quotations')}
          className="text-primary hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para orçamentos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 pb-24 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => router.push('/dashboard/quotations')}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Orçamento {quotation.number}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Detalhes e ações do orçamento
            </p>
          </div>
        </div>
        <div>
          <span className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium ${statusColors[quotation.status]}`}>
            {statusLabels[quotation.status]}
          </span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Cliente</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {quotation.customer?.name || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-success/10 rounded-lg">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Valor Total</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {formatCurrency(Number(quotation.totalAmount))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-warning/10 rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Válido até</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {quotation.validUntil ? formatDate(quotation.validUntil) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-accent rounded-lg">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Itens</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {quotation.items?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Observações */}
      {quotation.notes && (
        <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Observações</h3>
          <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{quotation.notes}</p>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow border border-border overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Itens do Orçamento</h2>
        </div>
        {/* Mobile: Indicador de scroll */}
        <div className="px-4 py-2 text-xs text-muted-foreground sm:hidden bg-muted/30">
          👉 Role horizontalmente para ver todos os detalhes
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Descrição
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Qtd.
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Preço Unit.
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {quotation.items?.map((item, index) => {
                const subtotal = Number(item.quantity) * Number(item.unitPrice);
                return (
                  <tr key={index} className="hover:bg-muted/50 active:bg-muted transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                      {item.description}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 text-right whitespace-nowrap">
                      {item.quantity}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 text-right whitespace-nowrap">
                      {formatCurrency(Number(item.unitPrice))}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                      {formatCurrency(subtotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-muted">
              <tr>
                <td colSpan={3} className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">
                  Total Geral
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-base sm:text-lg font-bold text-primary whitespace-nowrap">
                  {formatCurrency(Number(quotation.totalAmount))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {(quotation.status === 'pending' || quotation.status === 'draft') && (
              <>
                <button
                  onClick={handleSendEmail}
                  disabled={actionLoading !== null}
                  className="min-h-[44px] flex items-center justify-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
                >
                  {actionLoading === 'email' ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  <span className="hidden sm:inline">Enviar por Email</span>
                  <span className="sm:hidden">Enviar</span>
                </button>
              </>
            )}

            {quotation.status !== 'approved' && quotation.status !== 'rejected' && (
              <>
                <button
                  onClick={handleReject}
                  disabled={actionLoading !== null}
                  className="min-h-[44px] flex items-center justify-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 active:bg-destructive/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
                >
                  {actionLoading === 'reject' ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  Rejeitar
                </button>

                <button
                  onClick={handleApprove}
                  disabled={actionLoading !== null}
                  className="min-h-[44px] flex items-center justify-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-success text-success-foreground rounded-lg hover:bg-success/90 active:bg-success/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
                >
                  {actionLoading === 'approve' ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  Aprovar
                </button>
              </>
            )}

            <button
              onClick={handleDownloadPDF}
              disabled={actionLoading !== null}
              className="min-h-[44px] flex items-center justify-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 active:bg-secondary/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
            >
              {actionLoading === 'pdf' ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>

            {/* Botão de Assinatura Digital */}
            <SignDocumentButton
              documentType="quotation"
              documentId={quotation.id}
              documentNumber={quotation.number}
              isSigned={!!quotation.signedAt}
              signedAt={quotation.signedAt}
              signedBy={quotation.signedBy}
              signedDocumentUrl={quotation.signedDocumentUrl}
              onSignSuccess={loadQuotation}
            />

            {quotation.status === 'approved' && (
              <button
                onClick={handleConvertToOrder}
                disabled={actionLoading !== null && !quotation.serviceOrder}
                className={`min-h-[44px] flex items-center justify-center gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base ${
                  quotation.serviceOrder
                    ? 'bg-success text-success-foreground hover:bg-success/90 active:bg-success/80'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {actionLoading === 'convert' && !quotation.serviceOrder ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : quotation.serviceOrder ? (
                  <>
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Ver OS {quotation.serviceOrder.number}</span>
                    <span className="sm:hidden">Ver OS</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Converter em OS</span>
                    <span className="sm:hidden">Converter</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
