import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';

describe('AuditService', () => {
  let service: AuditService;
  let prismaService: PrismaService;

  const mockTenantId = 'tenant-123';
  const mockUserId = 'user-123';

  const mockAuditLog = {
    id: 'audit-1',
    tenantId: mockTenantId,
    userId: mockUserId,
    action: 'create',
    entity: 'customer',
    entityId: 'customer-1',
    changes: {},
    createdAt: new Date(),
  };

  const mockPrismaService = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  const mockTenantContextService = {
    getTenantId: jest.fn().mockReturnValue(mockTenantId),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TenantContextService, useValue: mockTenantContextService },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();

    mockPrismaService.auditLog.create.mockResolvedValue(mockAuditLog);
    mockPrismaService.auditLog.findMany.mockResolvedValue([mockAuditLog]);
    mockPrismaService.auditLog.count.mockResolvedValue(1);
    mockPrismaService.auditLog.groupBy.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logCreate', () => {
    it('should log create action', async () => {
      const result = await service.logCreate(
        mockUserId,
        'customer',
        'customer-1',
        { name: 'John Doe' },
      );

      expect(prismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: mockTenantId,
          userId: mockUserId,
          action: 'create',
          entity: 'customer',
          entityId: 'customer-1',
        }),
      });
      expect(result).toEqual(mockAuditLog);
    });
  });

  describe('logUpdate', () => {
    it('should log update action', async () => {
      await service.logUpdate(
        mockUserId,
        'customer',
        'customer-1',
        { name: 'Old' },
        { name: 'New' },
      );

      expect(prismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'update',
          entity: 'customer',
        }),
      });
    });
  });

  describe('logDelete', () => {
    it('should log delete action', async () => {
      await service.logDelete(mockUserId, 'customer', 'customer-1', {
        name: 'Deleted',
      });

      expect(prismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'delete',
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated audit logs', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(prismaService.auditLog.findMany).toHaveBeenCalled();
      expect(prismaService.auditLog.count).toHaveBeenCalled();
    });

    it('should apply filters', async () => {
      await service.findAll({
        page: 1,
        limit: 10,
        entity: 'customer',
        action: 'create',
        userId: mockUserId,
      });

      expect(prismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            entity: 'customer',
            action: 'create',
            userId: mockUserId,
          }),
        }),
      );
    });
  });

  describe('findByEntity', () => {
    it('should return logs for specific entity', async () => {
      const result = await service.findByEntity('customer', 'customer-1');

      expect(prismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            entity: 'customer',
            entityId: 'customer-1',
          }),
        }),
      );
      expect(result).toEqual([mockAuditLog]);
    });
  });

  describe('getStats', () => {
    it('should return audit statistics', async () => {
      const result = await service.getStats();

      expect(result).toHaveProperty('byAction');
      expect(result).toHaveProperty('byEntity');
      expect(result).toHaveProperty('byUser');
      expect(prismaService.auditLog.groupBy).toHaveBeenCalled();
    });
  });
});
