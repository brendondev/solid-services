'use client';

import { useState, useRef } from 'react';
import { FileSignature, Check, AlertCircle, Download, Loader2 } from 'lucide-react';
import { digitalSignatureAPI } from '@/lib/api/digital-signature';
import SignaturePad, { SignaturePadRef } from './SignaturePad';
import toast from 'react-hot-toast';

interface SignDocumentButtonProps {
  documentType: 'quotation' | 'order';
  documentId: string;
  documentNumber: string;
  isSigned: boolean;
  signedAt?: string | null;
  signedBy?: string | null;
  signedDocumentUrl?: string | null;
  onSignSuccess?: () => void;
}

export default function SignDocumentButton({
  documentType,
  documentId,
  documentNumber,
  isSigned,
  signedAt,
  signedBy,
  signedDocumentUrl,
  onSignSuccess,
}: SignDocumentButtonProps) {
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

      const result = await digitalSignatureAPI.signDocument({
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
      <div className="flex items-center gap-3 flex-wrap">
        {/* Badge de assinado */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
          <Check className="w-5 h-5" />
          <div className="flex flex-col">
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors min-h-[44px]"
        >
          <Download className="w-5 h-5" />
          <span className="text-sm font-medium">Baixar Documento Assinado</span>
        </a>
      </div>
    );
  }

  // Se não está assinado, mostrar botão de assinar
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-colors min-h-[44px]"
      >
        <FileSignature className="w-5 h-5" />
        <span className="text-sm font-medium">Assinar Documento</span>
      </button>

      {/* Modal de assinatura */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileSignature className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Assinar Documento
                </h3>
                <p className="text-sm text-gray-600 mt-1">
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

            {/* Método de assinatura */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Método de Assinatura
              </label>

              {/* Assinatura Local (disponível) */}
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mb-3">
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id="local"
                    name="signatureType"
                    checked
                    readOnly
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="local" className="flex-1">
                    <div className="font-medium text-gray-900">Assinatura Local</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Assinatura digital simples para uso interno
                    </div>
                  </label>
                </div>
              </div>

              {/* Assinatura Gov.br (em breve) */}
              <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 opacity-60">
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id="govbr"
                    name="signatureType"
                    disabled
                    className="mt-1 w-4 h-4 text-gray-400 cursor-not-allowed"
                  />
                  <label htmlFor="govbr" className="flex-1 cursor-not-allowed">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        Assinatura Gov.br 🇧🇷
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                        Em breve
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Assinatura eletrônica avançada com validade jurídica
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Aviso */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                A assinatura local não possui validade jurídica. Para assinaturas com
                validade legal, utilize a assinatura Gov.br (disponível em breve).
              </p>
            </div>

            {/* Botões */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isLoading}
                className="flex-1 min-h-[44px] px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSign}
                disabled={isLoading}
                className="flex-1 min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
