'use client';

import { useState, useEffect } from 'react';
import { customersApi } from '@/lib/api/customers';
import {
  ExternalLink,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Trash2,
  Calendar,
} from 'lucide-react';
import PortalLinkModal from './PortalLinkModal';

interface PortalAccessCardProps {
  customerId: string;
}

export default function PortalAccessCard({ customerId }: PortalAccessCardProps) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadTokenStatus();
  }, [customerId]);

  const loadTokenStatus = async () => {
    try {
      setLoading(true);
      const status = await customersApi.getTokenStatus(customerId);
      setTokenStatus(status);
    } catch (err) {
      console.error('Erro ao carregar status do token:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateToken = async () => {
    try {
      setProcessing(true);
      await customersApi.generatePortalToken(customerId);
      await loadTokenStatus();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao gerar token');
    } finally {
      setProcessing(false);
    }
  };

  const handleRevokeToken = async () => {
    if (!confirm('Tem certeza que deseja revogar o acesso ao portal deste cliente? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setProcessing(true);
      await customersApi.revokePortalToken(customerId);
      await loadTokenStatus();
      alert('Token revogado com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao revogar token');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    if (!tokenStatus?.portalUrl) return;

    try {
      await navigator.clipboard.writeText(tokenStatus.portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Acesso ao Portal do Cliente
        </h2>

        {!tokenStatus?.hasToken ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <ShieldX className="w-6 h-6 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Sem acesso ao portal</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Este cliente ainda não possui um link de acesso ao portal. Gere um token para
                  permitir que o cliente visualize orçamentos, ordens e histórico de serviços.
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateToken}
              disabled={processing}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando token...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Gerar Link de Acesso
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className={`flex items-start gap-3 p-4 border rounded-lg ${
              tokenStatus.isValidated
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              {tokenStatus.isValidated ? (
                <ShieldCheck className="w-6 h-6 text-green-600 mt-0.5" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-yellow-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-medium ${
                  tokenStatus.isValidated ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {tokenStatus.status}
                </h3>
                <p className={`text-sm mt-1 ${
                  tokenStatus.isValidated ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {tokenStatus.isValidated ? (
                    <>
                      Validado em{' '}
                      {tokenStatus.validatedAt
                        ? new Date(tokenStatus.validatedAt).toLocaleString('pt-BR')
                        : '-'}
                    </>
                  ) : (
                    'Aguardando primeira validação pelo cliente'
                  )}
                </p>

                {tokenStatus.lastUsedAt && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Último acesso: {new Date(tokenStatus.lastUsedAt).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </div>

            {/* Portal Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link de Acesso
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tokenStatus.portalUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Ver Detalhes
              </button>

              <button
                onClick={handleRevokeToken}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Revogar
              </button>
            </div>

            <div className="bg-gray-50 border-l-4 border-gray-400 p-4">
              <p className="text-xs text-gray-600">
                <strong>Nota:</strong> Este token é permanente e não expira. Ele ficará ativo até
                ser revogado manualmente. Após a primeira validação pelo cliente, o token não
                pode ser alterado.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && tokenStatus?.portalUrl && (
        <PortalLinkModal
          portalUrl={tokenStatus.portalUrl}
          isValidated={tokenStatus.isValidated}
          validatedAt={tokenStatus.validatedAt}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
