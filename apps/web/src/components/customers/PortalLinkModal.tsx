'use client';

import { useState } from 'react';
import { X, Copy, Check, ExternalLink, Calendar, FileText, Package } from 'lucide-react';

interface PortalLinkModalProps {
  portalUrl: string;
  expiresIn: string;
  onClose: () => void;
}

export default function PortalLinkModal({ portalUrl, expiresIn, onClose }: PortalLinkModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Link de Acesso ao Portal</h2>
            <p className="text-sm text-gray-600 mt-1">
              Compartilhe este link com o cliente para acesso ao portal
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* URL Box */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link de Acesso
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={portalUrl}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado!
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

          {/* Expiration Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">Validade do Link</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Este link expira em <strong>{expiresIn}</strong>. Após esse período, será
                  necessário gerar um novo link de acesso.
                </p>
              </div>
            </div>
          </div>

          {/* What client can do */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              O que o cliente pode fazer no portal:
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-3 text-sm text-gray-700">
                <FileText className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Visualizar e aprovar orçamentos:</strong> O cliente pode revisar
                  orçamentos enviados e aprová-los ou rejeitá-los diretamente pelo portal
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-700">
                <Package className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Acompanhar ordens de serviço:</strong> Ver o status em tempo real
                  das ordens de serviço em andamento, incluindo timeline de eventos
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-700">
                <Calendar className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Consultar histórico:</strong> Acessar o histórico completo de
                  serviços já realizados
                </span>
              </li>
            </ul>
          </div>

          {/* Usage Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">Como compartilhar</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Envie este link por email, WhatsApp ou SMS para o cliente. Ele não precisa
                  criar conta ou fazer login - o acesso é direto através do link.
                </p>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4">
            <p className="text-xs text-gray-600">
              <strong>Nota de segurança:</strong> Este link é pessoal e intransferível. Não
              compartilhe em canais públicos. O cliente terá acesso apenas aos seus próprios
              dados.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
          >
            Fechar
          </button>
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Testar Portal
          </a>
        </div>
      </div>
    </div>
  );
}
