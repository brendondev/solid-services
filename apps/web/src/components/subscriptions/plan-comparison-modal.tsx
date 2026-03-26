'use client';

import { X, Check, Star } from 'lucide-react';
import { useState } from 'react';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  description: string;
  features: {
    maxUsers: number;
    maxCustomers: number;
    maxOrdersPerMonth: number;
    maxStorageMB: number;
    features: string[];
  };
  isPopular?: boolean;
  isCurrent?: boolean;
}

interface PlanComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: Plan[];
  currentPlanId: string;
  onSelectPlan: (planId: string) => void;
}

export function PlanComparisonModal({
  isOpen,
  onClose,
  plans,
  currentPlanId,
  onSelectPlan,
}: PlanComparisonModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const filteredPlans = plans.filter(plan => plan.billingCycle === billingCycle);

  const allFeatures = Array.from(
    new Set(filteredPlans.flatMap(plan => plan.features.features))
  );

  const getLimitValue = (plan: Plan, feature: string): string => {
    if (feature.includes('Usuários')) {
      return plan.features.maxUsers === -1 ? 'Ilimitado' : `${plan.features.maxUsers}`;
    }
    if (feature.includes('Clientes')) {
      return plan.features.maxCustomers === -1 ? 'Ilimitado' : `${plan.features.maxCustomers}`;
    }
    if (feature.includes('Ordens')) {
      return plan.features.maxOrdersPerMonth === -1 ? 'Ilimitado' : `${plan.features.maxOrdersPerMonth}/mês`;
    }
    if (feature.includes('Armazenamento')) {
      if (plan.features.maxStorageMB === -1) return 'Ilimitado';
      if (plan.features.maxStorageMB >= 1024) {
        return `${(plan.features.maxStorageMB / 1024).toFixed(0)} GB`;
      }
      return `${plan.features.maxStorageMB} MB`;
    }
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Comparar Planos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Compare recursos e escolha o melhor plano para você
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            Mensal
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-blue-600 dark:bg-blue-500'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            Anual
            <span className="ml-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
              -20%
            </span>
          </span>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Plans Header */}
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-lg border-2 transition-all ${
                  plan.id === currentPlanId
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : plan.isPopular
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                }`}
              >
                {/* Badges */}
                <div className="flex flex-col gap-2 mb-4">
                  {plan.id === currentPlanId && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full w-fit">
                      <Check className="w-3 h-3" />
                      Plano Atual
                    </span>
                  )}
                  {plan.isPopular && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full w-fit">
                      <Star className="w-3 h-3 fill-current" />
                      Mais Popular
                    </span>
                  )}
                </div>

                {/* Plan Info */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-10">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      R$ {plan.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && plan.price > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      R$ {(plan.price / 12).toFixed(2)}/mês
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => {
                    if (plan.id !== currentPlanId) {
                      onSelectPlan(plan.id);
                    }
                  }}
                  disabled={plan.id === currentPlanId}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.id === currentPlanId
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : plan.isPopular
                      ? 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white'
                  }`}
                >
                  {plan.id === currentPlanId ? 'Plano Atual' : 'Selecionar Plano'}
                </button>
              </div>
            ))}

            {/* Features Comparison */}
            <div className="col-span-full mt-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Comparação de Recursos
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Feature Names Column */}
                <div className="space-y-4">
                  <div className="h-12 flex items-center font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                    Recurso
                  </div>
                  {allFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="h-12 flex items-center text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                    >
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Plan Features Columns */}
                {filteredPlans.map((plan) => (
                  <div key={plan.id} className="space-y-4">
                    <div className="h-12 flex items-center justify-center font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                      {plan.name}
                    </div>
                    {allFeatures.map((feature, index) => {
                      const hasFeature = plan.features.features.includes(feature);
                      const limitValue = getLimitValue(plan, feature);

                      return (
                        <div
                          key={index}
                          className="h-12 flex items-center justify-center text-sm border-b border-gray-200 dark:border-gray-700"
                        >
                          {hasFeature ? (
                            limitValue ? (
                              <span className="font-medium text-gray-900 dark:text-white">
                                {limitValue}
                              </span>
                            ) : (
                              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                            )
                          ) : (
                            <X className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
