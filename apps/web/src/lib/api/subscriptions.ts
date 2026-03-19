import api from './client';

export interface Plan {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  yearlyPrice?: number;
  limits: {
    maxUsers: number;
    maxCustomers: number;
    maxOrders: number;
    maxStorage: number;
  };
  features: {
    [key: string]: boolean;
  };
  isActive: boolean;
  sortOrder: number;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  plan?: Plan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  canceledAt?: string;
}

export interface CurrentUsage {
  metric: string;
  currentValue: number;
  limit: number;
  percentage: number;
  isUnlimited: boolean;
}

export interface SubscriptionStatus {
  subscription: Subscription;
  usage: CurrentUsage[];
  daysUntilRenewal: number;
  canUpgrade: boolean;
  canDowngrade: boolean;
}

export const subscriptionsApi = {
  // Planos
  async getAllPlans(): Promise<Plan[]> {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },

  async getPlanBySlug(slug: string): Promise<Plan> {
    const response = await api.get(`/subscriptions/plans/${slug}`);
    return response.data;
  },

  // Assinatura atual
  async getCurrentSubscription(): Promise<Subscription> {
    const response = await api.get('/subscriptions/current');
    return response.data;
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await api.get('/subscriptions/status');
    return response.data;
  },

  // Gerenciamento
  async updateSubscription(data: {
    planId?: string;
    billingCycle?: 'monthly' | 'yearly';
  }): Promise<Subscription> {
    const response = await api.patch('/subscriptions/update', data);
    return response.data;
  },

  async cancelSubscription(data?: {
    reason?: string;
    feedback?: string;
  }): Promise<Subscription> {
    const response = await api.post('/subscriptions/cancel', data);
    return response.data;
  },

  async reactivateSubscription(): Promise<Subscription> {
    const response = await api.post('/subscriptions/reactivate');
    return response.data;
  },

  // Verificações
  async hasFeature(featureName: string): Promise<boolean> {
    const response = await api.get(`/subscriptions/features/${featureName}`);
    return response.data.hasFeature;
  },

  async checkLimit(metric: string): Promise<boolean> {
    const response = await api.get(`/subscriptions/limits/${metric}`);
    return response.data.canProceed;
  },
};
