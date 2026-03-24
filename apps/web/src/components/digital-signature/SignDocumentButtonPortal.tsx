'use client';

import { useState, useRef } from 'react';
import { FileSignature, Check, AlertCircle, Download, Loader2 } from 'lucide-react';
import SignaturePad, { SignaturePadRef } from './SignaturePad';
import toast from 'react-hot-toast';
import api from '@/lib/api/client';

interface SignDocumentButtonPortalProps {
  documentType: 'quotation' | 'order';
  documentId: string;
  documentNumber: string;
  isSigned: boolean;
  signedAt?: string | null;
  signedDocumentUrl?: string | null;
  onSignSuccess?: () => void;
}

export default function SignDocumentButtonPortal({
  documentType,
  documentId,
  documentNumber,
  isSigned,
  signedAt,
  signedDocumentUrl,
  onSignSuccess,
}: SignDocumentButtonPortalProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const signaturePadRef = useRef<SignaturePadRef>(null);

  const handleSign = async () => {
    // Validar se a assinatura foi desenhada
    if (signaturePadRef.current?.isEmpty()) {
      toast.error('Por favor, desenhe sua assinatura antes de continuar');
      return;
    }

    setIsLoading(true);

    try {
      // Obter imagem da assinatura em base64
      const signatureImage = signaturePadRef.current?.toDataURL();

      // Portal usa endpoint sem autenticação JWT (usa token na URL)
      await api.post('/digital-signature/sign', {
        documentType,
        documentId,
        signatureType: 'local',
        signatureImage,
      });

      toast.success('Documento assinado com sucesso!');
      setShowModal(false);

      if (onSignSuccess) {
        onSignSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao assinar documento:', error);
      toast.error(
        error.response?.data?.message || 'Erro ao assinar documento. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Se já está assinado, mostrar badge e botão de download
  if (isSigned && signedDocumentUrl) {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Badge de assinado */}
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
          <Check className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium">Documento Assinado</span>
            {signedAt && (
              <span className="text-xs text-green-600">
                {new Date(signedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
        </div>

        {/* Botão de download */}
        <a
          href={signedDocumentUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors min-h-[48px] font-medium"
        >
          <Download className="w-5 h-5" />
          <span className="text-sm">Baixar Documento</span>
        </a>
      </div>
    );
  }

  // Se não está assinado, mostrar botão de assinar
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-colors min-h-[48px] font-medium"
      >
        <FileSignature className="w-5 h-5" />
        <span className="text-sm">Assinar Documento</span>
      </button>

      {/* Modal de assinatura */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileSignature className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Assinar Documento
                </h3>
                <p className="text-sm text-gray-600 mt-1 break-words">
                  {documentType === 'quotation' ? 'Orçamento' : 'Ordem de Serviço'} #{documentNumber}
                </p>
              </div>
            </div>

            {/* Pad de Assinatura */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Desenhe sua assinatura
              </label>
              <SignaturePad ref={signaturePadRef} />
            </div>

            {/* Aviso */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Ao assinar, você confirma que concorda com os termos e condições deste documento.
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isLoading}
                className="w-full sm:flex-1 min-h-[48px] px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSign}
                disabled={isLoading}
                className="w-full sm:flex-1 min-h-[48px] px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Assinando...</span>
                  </>
                ) : (
                  <>
                    <FileSignature className="w-5 h-5" />
                    <span>Assinar Agora</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
