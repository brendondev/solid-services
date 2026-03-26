'use client';

import { useState } from 'react';
import { X, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface PlanChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: {
    name: string;
    price: number;
    features: string[];
  };
  newPlan: {
    name: string;
    price: number;
    features: string[];
  };
  isUpgrade: boolean;
  loading?: boolean;
}

export function PlanChangeModal({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  newPlan,
  isUpgrade,
  loading = false,
}: PlanChangeModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    await onConfirm();
    setIsConfirming(false);
  };

  const priceDiff = newPlan.price - currentPlan.price;
  const Icon = isUpgrade ? TrendingUp : TrendingDown;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isUpgrade ? 'bg-green-100 dark:bg-green-900' : 'bg-amber-100 dark:bg-amber-900'}`}>
              <Icon className={`w-5 h-5 ${isUpgrade ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isUpgrade ? 'Upgrade de Plano' : 'Downgrade de Plano'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Plan Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Plan */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plano Atual</p>
              <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <p className="font-semibold text-gray-900 dark:text-white">{currentPlan.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  R$ {currentPlan.price.toFixed(2)}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mês</span>
                </p>
              </div>
            </div>

            {/* New Plan */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Novo Plano</p>
              <div className={`p-4 rounded-lg border-2 ${
                isUpgrade
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
              }`}>
                <p className="font-semibold text-gray-900 dark:text-white">{newPlan.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  R$ {newPlan.price.toFixed(2)}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mês</span>
                </p>
              </div>
            </div>
          </div>

          {/* Price Difference */}
          <div className={`p-4 rounded-lg ${
            isUpgrade
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
          }`}>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isUpgrade ? 'Investimento adicional:' : 'Economia mensal:'}
            </p>
            <p className={`text-xl font-bold mt-1 ${
              isUpgrade
                ? 'text-green-700 dark:text-green-400'
                : 'text-amber-700 dark:text-amber-400'
            }`}>
              {isUpgrade ? '+' : '-'} R$ {Math.abs(priceDiff).toFixed(2)}/mês
            </p>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-200">
                  Informações importantes:
                </p>
                <ul className="space-y-1 text-blue-800 dark:text-blue-300 list-disc list-inside">
                  {isUpgrade ? (
                    <>
                      <li>O upgrade será aplicado imediatamente</li>
                      <li>Você terá acesso a todos os novos recursos</li>
                      <li>A cobrança proporcional será feita no próximo ciclo</li>
                    </>
                  ) : (
                    <>
                      <li>O downgrade será aplicado no final do período atual</li>
                      <li>Você manterá o acesso aos recursos até lá</li>
                      <li>Dados excedentes aos novos limites serão mantidos (somente leitura)</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isUpgrade ? 'Novos recursos incluídos:' : 'Recursos que você perderá:'}
            </p>
            <div className="space-y-2">
              {newPlan.features
                .filter(feature => !currentPlan.features.includes(feature))
                .slice(0, 5)
                .map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-sm p-2 rounded ${
                      isUpgrade
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    }`}
                  >
                    <span className="font-medium">{isUpgrade ? '+' : '-'}</span>
                    <span>{feature}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming || loading}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isUpgrade
                ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                : 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800'
            }`}
          >
            {isConfirming || loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando...
              </span>
            ) : (
              `Confirmar ${isUpgrade ? 'Upgrade' : 'Downgrade'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
