'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PortalLayout from '@/components/portal/PortalLayout';
import DocumentVerificationModal from '@/components/portal/DocumentVerificationModal';
import {
  validateToken,
  getQuotations,
  getOrders,
  type CustomerData,
  type Quotation,
  type ServiceOrder,
} from '@/lib/api/portal';
import { FileText, Package, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PortalHomePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para verificação de documento
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  useEffect(() => {
    // Verificar se já tem dígitos no sessionStorage
    const hasDocumentDigits = sessionStorage.getItem('portal-document-digits');

    if (!hasDocumentDigits) {
      // Solicitar verificação de documento
      setShowDocumentModal(true);
      setLoading(false);
    } else {
      // Já validado, carregar dados normalmente
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validar token e obter dados do cliente
      const customerData = await validateToken();
      setCustomer(customerData);

      // Carregar dados em paralelo
      const [quotationsData, ordersData] = await Promise.all([
        getQuotations(),
        getOrders(),
      ]);

      setQuotations(quotationsData);
      setOrders(ordersData);
    } catch (err: any) {
      console.error('Error loading portal data:', err);
      setError(
        err.response?.data?.message || 'Token inválido ou expirado'
      );

      // Se erro 401 relacionado a dígitos, limpar sessionStorage e pedir novamente
      if (err.response?.status === 401) {
        sessionStorage.removeItem('portal-document-digits');
        setShowDocumentModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentVerification = async (digits: string) => {
    try {
      setVerifying(true);
      setVerificationError('');

      // Armazenar dígitos no sessionStorage
      sessionStorage.setItem('portal-document-digits', digits);

      // Tentar validar token com os dígitos
      await validateToken();

      // Sucesso! Fechar modal e carregar dados
      setShowDocumentModal(false);
      loadData();
    } catch (err: any) {
      console.error('Document verification error:', err);

      // Limpar dígitos inválidos
      sessionStorage.removeItem('portal-document-digits');

      // Mostrar erro específico
      if (err.response?.status === 401) {
        setVerificationError(
          err.response?.data?.message || 'Dígitos do documento incorretos. Verifique e tente novamente.'
        );
      } else {
        setVerificationError('Erro ao verificar documento. Tente novamente.');
      }
    } finally {
      setVerifying(false);
    }
  };

  // Modal de verificação de documento (prioridade máxima)
  if (showDocumentModal) {
    return (
      <DocumentVerificationModal
        onVerify={handleDocumentVerification}
        loading={verifying}
        error={verificationError}
      />
    );
  }

  if (loading) {
    return (
      <PortalLayout customerName="" customerId="" token={token}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout customerName="" customerId="" token={token}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Acesso Negado
          </h3>
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-red-600 mt-2">
            Entre em contato com nossa equipe para obter um novo link de acesso.
          </p>
        </div>
      </PortalLayout>
    );
  }

  const pendingQuotations = quotations.filter((q) => ['pending', 'sent'].includes(q.status));
  const activeOrders = orders.filter(
    (o) => o.status === 'scheduled' || o.status === 'in_progress'
  );
  const completedOrders = orders.filter((o) => o.status === 'completed');

  return (
    <PortalLayout customerName={customer?.name} customerId={customer?.id} token={token}>
      <div className="space-y-4 sm:space-y-6 animate-fadeInUp">
        {/* Welcome Message */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            Bem-vindo ao Portal do Cliente
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Acompanhe seus orçamentos, ordens de serviço e histórico de
            atendimentos.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Orçamentos Pendentes */}
          <Link href={`/portal/${token}/quotations`} className="block">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Orçamentos Pendentes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {pendingQuotations.length}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
              {pendingQuotations.length > 0 && (
                <p className="text-xs sm:text-sm text-blue-600 font-medium">
                  Clique para visualizar e aprovar →
                </p>
              )}
            </div>
          </Link>

          {/* Ordens Ativas */}
          <Link href={`/portal/${token}/orders`} className="block">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Ordens em Andamento</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {activeOrders.length}
                  </p>
                </div>
                <div className="bg-orange-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
              </div>
              {activeOrders.length > 0 && (
                <p className="text-xs sm:text-sm text-orange-600 font-medium">
                  Acompanhe o status em tempo real →
                </p>
              )}
            </div>
          </Link>

          {/* Serviços Completados */}
          <Link href={`/portal/${token}/history`} className="block">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Serviços Completados</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {completedOrders.length}
                  </p>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
              {completedOrders.length > 0 && (
                <p className="text-xs sm:text-sm text-green-600 font-medium">
                  Ver histórico completo →
                </p>
              )}
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        {pendingQuotations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4">
              Ações Pendentes
            </h3>
            <div className="space-y-3">
              {pendingQuotations.slice(0, 3).map((quotation) => (
                <div
                  key={quotation.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-lg p-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                      Orçamento #{quotation.number}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Valor: R$ {Number(quotation.totalAmount).toFixed(2)}
                    </p>
                  </div>
                  <Link
                    href={`/portal/${token}/quotations/${quotation.id}`}
                    className="w-full sm:w-auto min-h-[44px] flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-medium flex-shrink-0"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {activeOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Serviços em Andamento
            </h3>
            <div className="space-y-3">
              {activeOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Package className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        OS #{order.number}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                        Status: {getStatusLabel(order.status)}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/portal/${token}/orders/${order.id}`}
                    className="w-full sm:w-auto min-h-[44px] sm:min-h-0 flex items-center justify-center px-4 py-2 sm:py-0 text-blue-600 hover:text-blue-700 active:bg-blue-50 sm:active:bg-transparent rounded-lg sm:rounded-none transition-colors text-sm font-medium flex-shrink-0"
                  >
                    Ver Detalhes →
                  </Link>
                </div>
              ))}
            </div>
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
