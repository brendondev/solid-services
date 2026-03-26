'use client';

import { AlertTriangle, X, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface UsageAlertProps {
  feature: string;
  current: number;
  limit: number;
  onUpgrade: () => void;
}

export function UsageAlert({ feature, current, limit, onUpgrade }: UsageAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  const percentage = (current / limit) * 100;

  // Só mostra alerta se estiver acima de 70%
  if (percentage < 70 || dismissed) return null;

  const isNearLimit = percentage >= 70 && percentage < 90;
  const isAtLimit = percentage >= 90;

  const alertColors = isAtLimit
    ? {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-900 dark:text-red-200',
        icon: 'text-red-600 dark:text-red-400',
        button: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
      }
    : {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800',
        text: 'text-amber-900 dark:text-amber-200',
        icon: 'text-amber-600 dark:text-amber-400',
        button: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800',
      };

  return (
    <div className={`relative rounded-lg border p-4 ${alertColors.bg} ${alertColors.border}`}>
      {/* Close Button */}
      <button
        onClick={() => setDismissed(true)}
        className={`absolute top-3 right-3 ${alertColors.text} hover:opacity-70 transition-opacity`}
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <AlertTriangle className={`w-5 h-5 ${alertColors.icon}`} />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div>
            <h4 className={`font-semibold ${alertColors.text}`}>
              {isAtLimit ? 'Limite Quase Atingido!' : 'Atenção: Aproximando do Limite'}
            </h4>
            <p className={`text-sm mt-1 ${alertColors.text}`}>
              Você está usando <strong>{current}</strong> de <strong>{limit}</strong> {feature} disponíveis
              ({percentage.toFixed(0)}% do limite).
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white dark:bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isAtLimit
                  ? 'bg-red-600 dark:bg-red-500'
                  : 'bg-amber-600 dark:bg-amber-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={onUpgrade}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm transition-colors ${alertColors.button}`}
            >
              <TrendingUp className="w-4 h-4" />
              Fazer Upgrade
            </button>
            <p className={`text-xs ${alertColors.text}`}>
              {isAtLimit
                ? 'Você não poderá criar novos registros ao atingir o limite.'
                : 'Evite interrupções no seu trabalho.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface UsageAlertsProps {
  usage: {
    feature: string;
    current: number;
    limit: number;
  }[];
  onUpgrade: () => void;
}

export function UsageAlerts({ usage, onUpgrade }: UsageAlertsProps) {
  // Filtra apenas features que estão acima de 70% do limite
  const alertsToShow = usage.filter(item => {
    const percentage = (item.current / item.limit) * 100;
    return percentage >= 70;
  });

  if (alertsToShow.length === 0) return null;

  return (
    <div className="space-y-3">
      {alertsToShow.map((item) => (
        <UsageAlert
          key={item.feature}
          feature={item.feature}
          current={item.current}
          limit={item.limit}
          onUpgrade={onUpgrade}
        />
      ))}
    </div>
  );
}
