import { Test, TestingModule } from '@nestjs/testing';
import { SchedulingService } from './scheduling.service';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';

describe('SchedulingService', () => {
  let service: SchedulingService;
  let prismaService: PrismaService;

  const mockTenantId = 'tenant-123';

  const mockPrismaService = {
    serviceOrder: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };

  const mockTenantContextService = {
    getTenantId: jest.fn().mockReturnValue(mockTenantId),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TenantContextService, useValue: mockTenantContextService },
      ],
    }).compile();

    service = module.get<SchedulingService>(SchedulingService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();

    mockPrismaService.serviceOrder.findMany.mockResolvedValue([]);
    mockPrismaService.serviceOrder.count.mockResolvedValue(0);
    mockPrismaService.user.findMany.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getScheduleByDate', () => {
    it('should return orders scheduled for specific date', async () => {
      const date = new Date('2026-12-25');
      const mockOrders = [
        {
          id: 'order-1',
          number: 'OS-001',
          scheduledFor: new Date('2026-12-25T10:00:00Z'),
          status: 'scheduled',
        },
      ];

      mockPrismaService.serviceOrder.findMany.mockResolvedValue(mockOrders);

      const result = await service.getScheduleByDate(date);

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: mockTenantId,
            scheduledFor: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getScheduleByTechnician', () => {
    it('should return orders assigned to technician', async () => {
      const technicianId = 'tech-123';
      const mockOrders = [];

      mockPrismaService.serviceOrder.findMany.mockResolvedValue(mockOrders);

      const result = await service.getScheduleByTechnician(technicianId);

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: mockTenantId,
            assignedTo: technicianId,
          }),
        }),
      );
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getAvailableTechnicians', () => {
    it('should return available technicians', async () => {
      const mockTechnicians = [
        {
          id: 'tech-1',
          name: 'Technician 1',
          email: 'tech1@example.com',
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockTechnicians);

      const result = await service.getAvailableTechnicians();

      expect(result).toEqual(mockTechnicians);
    });
  });

  describe('getMonthView', () => {
    it('should return month view with orders count by day', async () => {
      const year = 2026;
      const month = 12;

      const result = await service.getMonthView(year, month);

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
