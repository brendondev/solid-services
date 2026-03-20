'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PortalLayout from '@/components/portal/PortalLayout';
import {
  validateToken,
  getQuotation,
  approveQuotation,
  rejectQuotation,
  downloadQuotationPdf,
  type CustomerData,
  type Quotation,
} from '@/lib/api/portal';
import {
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  ArrowLeft,
  FileText,
  Download,
} from 'lucide-react';
import Link from 'next/link';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const id = params.id as string;

  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<
    'approve' | 'reject' | null
  >(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [customerData, quotationData] = await Promise.all([
          validateToken(),
          getQuotation(id),
        ]);
        setCustomer(customerData);
        setQuotation(quotationData);
      } catch (err) {
        console.error('Error loading quotation:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, id]);

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await approveQuotation(id);
      // Recarregar dados
      const updated = await getQuotation(id);
      setQuotation(updated);
      setShowConfirmModal(null);
    } catch (err) {
      console.error('Error approving quotation:', err);
      alert('Erro ao aprovar orçamento. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setProcessing(true);
      await rejectQuotation(id);
      // Recarregar dados
      const updated = await getQuotation(id);
      setQuotation(updated);
      setShowConfirmModal(null);
    } catch (err) {
      console.error('Error rejecting quotation:', err);
      alert('Erro ao rejeitar orçamento. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      await downloadQuotationPdf(id);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Erro ao baixar PDF. Tente novamente.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout customerName="" token={token}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PortalLayout>
    );
  }

  if (!quotation) {
    return (
      <PortalLayout customerName={customer?.name} token={token}>
        <div className="text-center py-12">
          <p className="text-gray-600">Orçamento não encontrado.</p>
        </div>
      </PortalLayout>
    );
  }

  const canRespond = quotation.status === 'sent';

  return (
    <PortalLayout customerName={customer?.name} token={token}>
      <div className="space-y-6">
        {/* Back Button and Actions */}
        <div className="flex items-center justify-between">
          <Link
            href={`/portal/${token}/quotations`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para orçamentos
          </Link>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            {downloadingPdf ? 'Baixando...' : 'Baixar PDF'}
          </button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Orçamento #{quotation.number}
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                <span className="text-sm text-gray-600">
                  Válido até:{' '}
                  {new Date(quotation.validUntil).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {quotation.status === 'approved' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                <span className="font-medium">Aprovado</span>
              </div>
            )}
            {quotation.status === 'rejected' && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-6 w-6" />
                <span className="font-medium">Rejeitado</span>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Itens do Orçamento
          </h3>
          <div className="space-y-3">
            {quotation.items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {item.service.name}
                  </p>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Quantidade: {item.quantity} x R${' '}
                    {item.unitPrice.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    R$ {item.subtotal.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 mt-6 pt-4 space-y-2">
            {quotation.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Desconto:</span>
                <span className="text-gray-900">
                  - R$ {quotation.discount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-900">Valor Total:</span>
              <span className="text-blue-600">
                R$ {quotation.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Observations */}
        {quotation.observations && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Observações
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {quotation.observations}
            </p>
          </div>
        )}

        {/* Actions */}
        {canRespond && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Responder Orçamento
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal('approve')}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Aprovar Orçamento
              </button>
              <button
                onClick={() => setShowConfirmModal('reject')}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <XCircle className="h-5 w-5" />
                Rejeitar Orçamento
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {showConfirmModal === 'approve'
                  ? 'Confirmar Aprovação'
                  : 'Confirmar Rejeição'}
              </h3>
              <p className="text-gray-700 mb-6">
                {showConfirmModal === 'approve'
                  ? 'Você está prestes a aprovar este orçamento. Esta ação notificará nossa equipe para dar início ao serviço.'
                  : 'Você está prestes a rejeitar este orçamento. Nossa equipe será notificada e poderá entrar em contato para entender melhor suas necessidades.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(null)}
                  disabled={processing}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={
                    showConfirmModal === 'approve'
                      ? handleApprove
                      : handleReject
                  }
                  disabled={processing}
                  className={`flex-1 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                    showConfirmModal === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing ? 'Processando...' : 'Confirmar'}
                </button>
              </div>
            </div>
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
