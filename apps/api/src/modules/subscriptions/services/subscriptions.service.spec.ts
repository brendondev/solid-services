import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prismaService: PrismaService;

  const mockTenantId = 'tenant-123';

  const mockSubscription = {
    id: 'sub-1',
    tenantId: mockTenantId,
    planId: 'plan-basic',
    status: 'active',
    startDate: new Date(),
    plan: {
      id: 'plan-basic',
      name: 'Basic',
      price: 49.90,
    },
  };

  const mockPrismaService = {
    subscription: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    plan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    usageRecord: {
      create: jest.fn(),
    },
  };

  const mockTenantContextService = {
    getTenantId: jest.fn().mockReturnValue(mockTenantId),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TenantContextService, useValue: mockTenantContextService },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentSubscription', () => {
    it('should return current subscription', async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockSubscription,
      );

      const result = await service.getCurrentSubscription();

      expect(prismaService.subscription.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: mockTenantId,
            status: 'active',
          }),
        }),
      );
      expect(result).toEqual(mockSubscription);
    });

    it('should throw NotFoundException if no subscription found', async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      await expect(service.getCurrentSubscription()).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllPlans', () => {
    it('should return all available plans', async () => {
      const mockPlans = [
        { id: 'free', name: 'Free', price: 0 },
        { id: 'basic', name: 'Basic', price: 49.90 },
      ];

      mockPrismaService.plan.findMany.mockResolvedValue(mockPlans);

      const result = await service.getAllPlans();

      expect(prismaService.plan.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockPlans);
    });
  });

  describe('checkFeature', () => {
    it('should return true if feature is available in plan', async () => {
      const mockPlan = {
        id: 'pro',
        features: { nfe: true, portal: true },
      };

      mockPrismaService.subscription.findFirst.mockResolvedValue({
        ...mockSubscription,
        plan: mockPlan,
      });

      const result = await service.checkFeature('nfe');

      expect(result).toBe(true);
    });

    it('should return false if feature not available', async () => {
      const mockPlan = {
        id: 'free',
        features: { nfe: false },
      };

      mockPrismaService.subscription.findFirst.mockResolvedValue({
        ...mockSubscription,
        plan: mockPlan,
      });

      const result = await service.checkFeature('nfe');

      expect(result).toBe(false);
    });
  });

  describe('updatePlan', () => {
    it('should update subscription plan', async () => {
      const newPlanId = 'plan-pro';
      const mockNewPlan = {
        id: newPlanId,
        name: 'Pro',
        price: 99.90,
      };

      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockSubscription,
      );
      mockPrismaService.plan.findUnique.mockResolvedValue(mockNewPlan);
      mockPrismaService.subscription.update.mockResolvedValue({
        ...mockSubscription,
        planId: newPlanId,
      });

      const result = await service.updatePlan(newPlanId);

      expect(prismaService.subscription.update).toHaveBeenCalled();
      expect(result.planId).toBe(newPlanId);
    });

    it('should throw BadRequestException if plan not found', async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockSubscription,
      );
      mockPrismaService.plan.findUnique.mockResolvedValue(null);

      await expect(service.updatePlan('invalid-plan')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
