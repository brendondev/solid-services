export class PlanDto {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  price: number;
  yearlyPrice?: number | null;
  limits: {
    maxUsers: number;
    maxCustomers: number;
    maxOrders: number;
    maxStorage: number;
    maxMonthlyOrders?: number;
  };
  features: {
    customers: boolean;
    services: boolean;
    quotations: boolean;
    orders: boolean;
    basic_financial: boolean;
    portal_client: boolean;
    nfe: boolean;
    whatsapp: boolean;
    api: boolean;
    advanced_reports: boolean;
    recurring_contracts: boolean;
    custom_fields: boolean;
    priority_support: boolean;
    [key: string]: any;
  };
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class SubscriptionDto {
  id: string;
  tenantId: string;
  planId: string;
  plan?: PlanDto;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEndsAt?: Date;
  canceledAt?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CurrentUsageDto {
  metric: string;
  currentValue: number;
  limit: number;
  percentage: number;
  isUnlimited: boolean;
}

export class SubscriptionStatusDto {
  subscription: SubscriptionDto;
  usage: CurrentUsageDto[];
  daysUntilRenewal: number;
  canUpgrade: boolean;
  canDowngrade: boolean;
}
