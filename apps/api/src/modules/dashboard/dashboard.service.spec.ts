import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';

describe('DashboardService', () => {
  let service: DashboardService;
  let prismaService: PrismaService;

  const mockTenantId = 'tenant-123';

  const mockPrismaService = {
    customer: { count: jest.fn() },
    service: { count: jest.fn() },
    quotation: { groupBy: jest.fn(), count: jest.fn() },
    serviceOrder: { groupBy: jest.fn(), count: jest.fn(), findMany: jest.fn() },
    receivable: { aggregate: jest.fn(), count: jest.fn(), findMany: jest.fn() },
    payment: { aggregate: jest.fn() },
    payable: { aggregate: jest.fn() },
    payablePayment: { aggregate: jest.fn() },
  };

  const mockTenantContextService = {
    getTenantId: jest.fn().mockReturnValue(mockTenantId),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TenantContextService, useValue: mockTenantContextService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();

    // Setup default mocks
    mockPrismaService.customer.count.mockResolvedValue(10);
    mockPrismaService.service.count.mockResolvedValue(5);
    mockPrismaService.quotation.groupBy.mockResolvedValue([]);
    mockPrismaService.quotation.count.mockResolvedValue(0);
    mockPrismaService.serviceOrder.groupBy.mockResolvedValue([]);
    mockPrismaService.serviceOrder.count.mockResolvedValue(0);
    mockPrismaService.serviceOrder.findMany.mockResolvedValue([]);
    mockPrismaService.receivable.aggregate.mockResolvedValue({
      _sum: { amount: 1000, paidAmount: 200 },
      _count: { id: 5 },
    });
    mockPrismaService.receivable.count.mockResolvedValue(5);
    mockPrismaService.payment.aggregate.mockResolvedValue({
      _sum: { amount: 500 },
    });
    mockPrismaService.payable.aggregate.mockResolvedValue({
      _sum: { amount: 600, paidAmount: 100 },
    });
    mockPrismaService.payablePayment.aggregate.mockResolvedValue({
      _sum: { amount: 300 },
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOperationalDashboard', () => {
    it('should return operational dashboard with metrics', async () => {
      const result = await service.getOperationalDashboard();

      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('quotations');
      expect(result).toHaveProperty('orders');
      expect(result).toHaveProperty('recentOrders');
      expect(result).toHaveProperty('upcomingOrders');
      expect(result.summary).toHaveProperty('activeCustomers');
      expect(result.summary).toHaveProperty('activeServices');
    });

    it('should call prisma aggregations', async () => {
      await service.getOperationalDashboard();

      expect(prismaService.customer.count).toHaveBeenCalled();
      expect(prismaService.service.count).toHaveBeenCalled();
      expect(prismaService.quotation.groupBy).toHaveBeenCalled();
      expect(prismaService.serviceOrder.groupBy).toHaveBeenCalled();
    });
  });

  describe('getQuickStats', () => {
    it('should return quick stats', async () => {
      const result = await service.getQuickStats();

      expect(result).toHaveProperty('pendingQuotations');
      expect(result).toHaveProperty('activeOrders');
      expect(result).toHaveProperty('overdueReceivables');
    });
  });

  describe('getMonthlyPerformance', () => {
    it('should return monthly performance metrics', async () => {
      const result = await service.getMonthlyPerformance();

      expect(result).toBeDefined();
      expect(prismaService.serviceOrder.count).toHaveBeenCalled();
      expect(prismaService.payment.aggregate).toHaveBeenCalled();
    });
  });

  describe('getRevenueHistory', () => {
    it('should return revenue history for last 6 months', async () => {
      mockPrismaService.payment.aggregate.mockResolvedValue({
        _sum: { amount: 5000 },
      });
      mockPrismaService.receivable.aggregate.mockResolvedValue({
        _sum: { amount: 8000 },
      });

      const result = await service.getRevenueHistory(6);

      expect(result).toHaveLength(6);
      expect(result[0]).toHaveProperty('month');
      expect(result[0]).toHaveProperty('year');
      expect(result[0]).toHaveProperty('received');
      expect(result[0]).toHaveProperty('total');
    });

    it('should accept custom months parameter', async () => {
      mockPrismaService.payment.aggregate.mockResolvedValue({
        _sum: { amount: 0 },
      });
      mockPrismaService.receivable.aggregate.mockResolvedValue({
        _sum: { amount: 0 },
      });

      const result = await service.getRevenueHistory(12);

      expect(result).toHaveLength(12);
    });
  });

  describe('getOrdersHistory', () => {
    it('should return orders history for last 6 months', async () => {
      mockPrismaService.serviceOrder.count
        .mockResolvedValueOnce(10) // created
        .mockResolvedValueOnce(8) // completed
        .mockResolvedValueOnce(1); // cancelled

      const result = await service.getOrdersHistory(6);

      expect(result).toHaveLength(6);
      expect(result[0]).toHaveProperty('created');
      expect(result[0]).toHaveProperty('completed');
      expect(result[0]).toHaveProperty('cancelled');
    });
  });

  describe('getTopCustomers', () => {
    it('should return top 5 customers by revenue', async () => {
      const mockReceivables = [
        {
          amount: 1000,
          paidAmount: 1000,
          serviceOrder: {
            customer: {
              id: 'cust-1',
              name: 'Customer 1',
              email: 'cust1@test.com',
            },
          },
        },
        {
          amount: 500,
          paidAmount: 500,
          serviceOrder: {
            customer: {
              id: 'cust-1',
              name: 'Customer 1',
              email: 'cust1@test.com',
            },
          },
        },
      ];

      mockPrismaService.receivable.findMany.mockResolvedValue(mockReceivables);

      const result = await service.getTopCustomers(5);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(prismaService.receivable.findMany).toHaveBeenCalled();
    });

    it('should aggregate revenue by customer', async () => {
      const mockReceivables = [
        {
          amount: 1000,
          paidAmount: 800,
          serviceOrder: {
            customer: {
              id: 'cust-1',
              name: 'Customer 1',
              email: 'cust1@test.com',
            },
          },
        },
        {
          amount: 500,
          paidAmount: 500,
          serviceOrder: {
            customer: {
              id: 'cust-1',
              name: 'Customer 1',
              email: 'cust1@test.com',
            },
          },
        },
      ];

      mockPrismaService.receivable.findMany.mockResolvedValue(mockReceivables);

      const result = await service.getTopCustomers(5);

      expect(result[0].totalRevenue).toBe(1300); // 800 + 500
      expect(result[0].ordersCount).toBe(2);
    });
  });
});
