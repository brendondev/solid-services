'use client';

import { useState } from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface DocumentVerificationModalProps {
  onVerify: (digits: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

/**
 * Modal para verificação de documento (4 primeiros dígitos do CPF/CNPJ)
 *
 * Adiciona camada de segurança ao portal do cliente
 */
export default function DocumentVerificationModal({
  onVerify,
  loading = false,
  error,
}: DocumentVerificationModalProps) {
  const [digits, setDigits] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Validação básica
    if (digits.length !== 4) {
      setLocalError('Informe exatamente 4 dígitos');
      return;
    }

    if (!/^\d{4}$/.test(digits)) {
      setLocalError('Apenas números são permitidos');
      return;
    }

    await onVerify(digits);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setDigits(value);
    setLocalError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Verificação de Segurança
            </h2>
            <p className="text-sm text-gray-600">
              Protegendo seus dados
            </p>
          </div>
        </div>

        {/* Descrição */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Para sua segurança, precisamos verificar sua identidade antes de
            conceder acesso ao portal.
          </p>
          <p className="text-gray-700">
            Por favor, informe os <strong>4 primeiros dígitos</strong> do seu{' '}
            <strong>CPF ou CNPJ</strong> cadastrado no sistema.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="digits"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              4 Primeiros Dígitos do CPF/CNPJ
            </label>
            <input
              id="digits"
              type="text"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={digits}
              onChange={handleInputChange}
              placeholder="0000"
              disabled={loading}
              className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed tracking-widest"
              autoFocus
              required
            />
          </div>

          {/* Erro Local (validação) */}
          {localError && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">{localError}</p>
            </div>
          )}

          {/* Erro da API */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading || digits.length !== 4}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verificando...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Verificar Acesso
              </>
            )}
          </button>
        </form>

        {/* Info adicional */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">
            <strong>Por que pedimos isso?</strong>
            <br />
            Esta verificação garante que apenas você tenha acesso às suas
            informações. Seus dados estão seguros e nunca serão compartilhados.
          </p>
        </div>
      </div>
    </div>
  );
}
