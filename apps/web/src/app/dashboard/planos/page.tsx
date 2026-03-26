'use client';

import { useEffect, useState } from 'react';
import { subscriptionsApi, Plan, SubscriptionStatus } from '@/lib/api/subscriptions';
import { Crown, Check, Zap, TrendingUp, Calendar, CreditCard, AlertCircle, ArrowLeftRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { PlanChangeModal, UsageAlerts, PlanComparisonModal } from '@/components/subscriptions';

export default function PlanosPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingToPlan, setUpgradingToPlan] = useState<string | null>(null);

  // Modals state
  const [selectedPlanForChange, setSelectedPlanForChange] = useState<Plan | null>(null);
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, statusData] = await Promise.all([
        subscriptionsApi.getAllPlans(),
        subscriptionsApi.getSubscriptionStatus(),
      ]);
      setPlans(plansData);
      setStatus(statusData);
    } catch (error: any) {
      toast.error('Erro ao carregar planos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (plan: Plan) => {
    setSelectedPlanForChange(plan);
    setShowPlanChangeModal(true);
  };

  const confirmPlanChange = async () => {
    if (!selectedPlanForChange) return;

    setUpgradingToPlan(selectedPlanForChange.id);
    try {
      await subscriptionsApi.updateSubscription({ planId: selectedPlanForChange.id });
      toast.success('Plano atualizado com sucesso!');
      setShowPlanChangeModal(false);
      setSelectedPlanForChange(null);
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar plano');
    } finally {
      setUpgradingToPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPlan = status?.subscription.plan;
  const isYearly = status?.subscription.billingCycle === 'yearly';

  // Preparar dados de uso para alertas
  const usageAlerts = status?.usage
    .filter(u => !u.isUnlimited && u.percentage >= 70)
    .map(u => ({
      feature: u.metric === 'users' ? 'usuários' :
               u.metric === 'customers' ? 'clientes' :
               u.metric === 'orders' ? 'ordens de serviço' :
               'MB de armazenamento',
      current: u.currentValue,
      limit: u.limit,
    })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="w-8 h-8 text-amber-500" />
            Planos e Assinaturas
          </h1>
          <p className="mt-2 text-muted-foreground">
            Escolha o plano ideal para o seu negócio
          </p>
        </div>
        <button
          onClick={() => setShowComparisonModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Comparar Planos
        </button>
      </div>

      {/* Usage Alerts */}
      {usageAlerts.length > 0 && (
        <UsageAlerts
          usage={usageAlerts}
          onUpgrade={() => {
            // Sugere o próximo plano acima
            const currentIndex = plans.findIndex(p => p.id === currentPlan?.id);
            if (currentIndex >= 0 && currentIndex < plans.length - 1) {
              handleUpgrade(plans[currentIndex + 1]);
            }
          }}
        />
      )}

      {/* Current Plan Info */}
      {currentPlan && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Plano Atual: {currentPlan.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Status: <span className="font-medium text-gray-900 capitalize">{status.subscription.status}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Renovação em: <span className="font-medium text-gray-900">{status.daysUntilRenewal} dias</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                R$ {isYearly && currentPlan.yearlyPrice ? currentPlan.yearlyPrice.toFixed(2) : currentPlan.price.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                /{isYearly ? 'ano' : 'mês'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Dashboard */}
      {status && (
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Uso Atual
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {status.usage.map((usage) => (
              <div key={usage.metric} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium capitalize">
                    {usage.metric === 'users' && 'Usuários'}
                    {usage.metric === 'customers' && 'Clientes'}
                    {usage.metric === 'orders' && 'Ordens de Serviço'}
                    {usage.metric === 'storage' && 'Armazenamento'}
                  </span>
                  <span className="text-muted-foreground">
                    {usage.isUnlimited ? (
                      <span className="text-success font-medium">Ilimitado</span>
                    ) : (
                      `${usage.currentValue} / ${usage.limit}`
                    )}
                  </span>
                </div>
                {!usage.isUnlimited && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        usage.percentage >= 90
                          ? 'bg-destructive'
                          : usage.percentage >= 70
                          ? 'bg-amber-500'
                          : 'bg-success'
                      }`}
                      style={{ width: `${Math.min(usage.percentage, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan?.id === plan.id;
          const isMostPopular = plan.slug === 'pro';

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg border-2 p-6 transition-all hover:shadow-lg ${
                isMostPopular
                  ? 'border-primary shadow-md'
                  : isCurrentPlan
                  ? 'border-success'
                  : 'border-border'
              }`}
            >
              {/* Most Popular Badge */}
              {isMostPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  MAIS POPULAR
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4 bg-success text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  PLANO ATUAL
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <Crown className={`w-8 h-8 mx-auto mb-2 ${
                  plan.slug === 'free' ? 'text-gray-400' :
                  plan.slug === 'basic' ? 'text-blue-500' :
                  plan.slug === 'pro' ? 'text-amber-500' :
                  'text-purple-500'
                }`} />
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price.toFixed(2).split('.')[0]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ,{plan.price.toFixed(2).split('.')[1]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">/mês</p>
                {plan.yearlyPrice && plan.yearlyPrice > 0 && (
                  <p className="text-xs text-success mt-1">
                    R$ {plan.yearlyPrice.toFixed(2)}/ano (economize!)
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    {plan.limits.maxUsers === -1 ? 'Usuários ilimitados' : `${plan.limits.maxUsers} usuário(s)`}
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    {plan.limits.maxCustomers === -1 ? 'Clientes ilimitados' : `${plan.limits.maxCustomers} clientes`}
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    {plan.limits.maxOrders === -1 ? 'Ordens ilimitadas' : `${plan.limits.maxOrders} ordens/mês`}
                  </span>
                </li>
                {plan.features.nfe && (
                  <li className="flex items-start gap-2 text-sm">
                    <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">NFe/NFS-e</span>
                  </li>
                )}
                {plan.features.whatsapp && (
                  <li className="flex items-start gap-2 text-sm">
                    <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">Integração WhatsApp</span>
                  </li>
                )}
                {plan.features.api && (
                  <li className="flex items-start gap-2 text-sm">
                    <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">Acesso API</span>
                  </li>
                )}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleUpgrade(plan)}
                disabled={isCurrentPlan || upgradingToPlan === plan.id}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  isCurrentPlan
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isMostPopular
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {upgradingToPlan === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando...
                  </span>
                ) : isCurrentPlan ? (
                  'Plano Atual'
                ) : currentPlan && plan.price > currentPlan.price ? (
                  'Fazer Upgrade'
                ) : currentPlan && plan.price < currentPlan.price ? (
                  'Fazer Downgrade'
                ) : (
                  'Selecionar Plano'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ / Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              Precisa de ajuda para escolher?
            </h4>
            <p className="text-sm text-blue-800">
              Entre em contato conosco e nossa equipe te ajudará a escolher o melhor plano para o seu negócio.
              Todas as mudanças de plano são processadas imediatamente.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedPlanForChange && currentPlan && (
        <PlanChangeModal
          isOpen={showPlanChangeModal}
          onClose={() => {
            setShowPlanChangeModal(false);
            setSelectedPlanForChange(null);
          }}
          onConfirm={confirmPlanChange}
          currentPlan={{
            name: currentPlan.name,
            price: isYearly && currentPlan.yearlyPrice ? currentPlan.yearlyPrice : currentPlan.price,
            features: [
              currentPlan.limits.maxUsers === -1 ? 'Usuários ilimitados' : `${currentPlan.limits.maxUsers} usuários`,
              currentPlan.limits.maxCustomers === -1 ? 'Clientes ilimitados' : `${currentPlan.limits.maxCustomers} clientes`,
              currentPlan.limits.maxOrders === -1 ? 'Ordens ilimitadas' : `${currentPlan.limits.maxOrders} ordens/mês`,
            ],
          }}
          newPlan={{
            name: selectedPlanForChange.name,
            price: isYearly && selectedPlanForChange.yearlyPrice ? selectedPlanForChange.yearlyPrice : selectedPlanForChange.price,
            features: [
              selectedPlanForChange.limits.maxUsers === -1 ? 'Usuários ilimitados' : `${selectedPlanForChange.limits.maxUsers} usuários`,
              selectedPlanForChange.limits.maxCustomers === -1 ? 'Clientes ilimitados' : `${selectedPlanForChange.limits.maxCustomers} clientes`,
              selectedPlanForChange.limits.maxOrders === -1 ? 'Ordens ilimitadas' : `${selectedPlanForChange.limits.maxOrders} ordens/mês`,
            ],
          }}
          isUpgrade={selectedPlanForChange.price > currentPlan.price}
          loading={upgradingToPlan === selectedPlanForChange.id}
        />
      )}

      {currentPlan && (
        <PlanComparisonModal
          isOpen={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          plans={plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            slug: plan.slug,
            price: isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price,
            billingCycle: isYearly ? 'yearly' : 'monthly',
            description: plan.description || '',
            features: {
              maxUsers: plan.limits.maxUsers,
              maxCustomers: plan.limits.maxCustomers,
              maxOrdersPerMonth: plan.limits.maxOrders,
              maxStorageMB: plan.limits.maxStorage || 100,
              features: [
                'Usuários',
                'Clientes',
                'Ordens de Serviço',
                'Armazenamento',
                ...(plan.features.nfe ? ['Emissão de NFe/NFS-e'] : []),
                ...(plan.features.whatsapp ? ['Integração WhatsApp'] : []),
                ...(plan.features.api ? ['Acesso à API'] : []),
                ...(plan.features.customization ? ['Customização avançada'] : []),
              ],
            },
            isPopular: plan.slug === 'pro',
            isCurrent: plan.id === currentPlan.id,
          }))}
          currentPlanId={currentPlan.id}
          onSelectPlan={(planId) => {
            const plan = plans.find(p => p.id === planId);
            if (plan) {
              setShowComparisonModal(false);
              handleUpgrade(plan);
            }
          }}
        />
      )}
    </div>
  );
}
