'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PortalLayout from '@/components/portal/PortalLayout';
import {
  validateToken,
  getOrder,
  downloadOrderPdf,
  type CustomerData,
  type ServiceOrder,
} from '@/lib/api/portal';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Paperclip,
  Download,
  FileDown,
} from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const token = params.token as string;
  const id = params.id as string;

  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [customerData, orderData] = await Promise.all([
          validateToken(),
          getOrder(id),
        ]);
        setCustomer(customerData);
        setOrder(orderData);
      } catch (err) {
        console.error('Error loading order:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, id]);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      await downloadOrderPdf(id);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Erro ao baixar PDF. Tente novamente.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout customerName="" customerId="" token={token}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PortalLayout>
    );
  }

  if (!order) {
    return (
      <PortalLayout customerName={customer?.name} customerId={customer?.id} token={token}>
        <div className="text-center py-12">
          <p className="text-gray-600">Ordem de serviço não encontrada.</p>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout customerName={customer?.name} token={token}>
      <div className="space-y-4 sm:space-y-6 animate-fadeInUp">
        {/* Back Button and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link
            href={`/portal/${token}/orders`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 active:text-gray-700 min-h-[44px] text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            Voltar para ordens
          </Link>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
          >
            <FileDown className="h-4 w-4 sm:h-5 sm:w-5" />
            {downloadingPdf ? 'Baixando...' : 'Baixar PDF'}
          </button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              Ordem de Serviço #{order.number}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
              <span
                className={`px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium w-fit ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusLabel(order.status)}
              </span>
              {order.scheduledFor && (
                <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(order.scheduledFor).toLocaleDateString('pt-BR')}{' '}
                  às{' '}
                  {new Date(order.scheduledFor).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        {order.items && order.items.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Serviços
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    {item.description && (
                      <p className="text-sm sm:text-base font-medium text-gray-900">
                        {item.description}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Quantidade: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist */}
        {order.checklists && order.checklists.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Checklist de Execução
            </h3>
            <div className="space-y-2">
              {order.checklists
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {item.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm sm:text-base ${
                        item.isCompleted
                          ? 'text-gray-600 line-through'
                          : 'text-gray-900'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {order.timeline && order.timeline.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Histórico de Eventos
            </h3>
            <div className="space-y-4">
              {order.timeline.map((event, index) => (
                <div key={event.id} className="flex gap-3 sm:gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    {index < order.timeline!.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900">{event.event}</p>
                    {event.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {event.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {order.attachments && order.attachments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Anexos e Comprovantes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {order.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                >
                  <Paperclip className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {attachment.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(attachment.uploadedAt).toLocaleDateString(
                        'pt-BR'
                      )}
                    </p>
                  </div>
                  <a
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Baixar anexo"
                  >
                    <Download className="h-4 w-4 text-gray-600" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observations */}
        {order.observations && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
              Observações
            </h3>
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">
              {order.observations}
            </p>
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
