import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { CreateServiceDto, UpdateServiceDto } from './dto';

describe('ServicesService', () => {
  let service: ServicesService;
  let prismaService: PrismaService;
  let tenantContext: TenantContextService;

  const mockTenantId = 'tenant-123';
  const mockServiceId = 'service-456';

  const mockService = {
    id: mockServiceId,
    tenantId: mockTenantId,
    name: 'Consultoria',
    description: 'Serviço de consultoria',
    defaultPrice: 150.0,
    estimatedDuration: 60,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    service: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    quotationItem: {
      count: jest.fn(),
    },
    orderItem: {
      count: jest.fn(),
    },
  };

  const mockTenantContextService = {
    getTenantId: jest.fn().mockReturnValue(mockTenantId),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TenantContextService,
          useValue: mockTenantContextService,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    prismaService = module.get<PrismaService>(PrismaService);
    tenantContext = module.get<TenantContextService>(TenantContextService);

    // Limpar mocks entre testes
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new service with default status', async () => {
      const createDto: CreateServiceDto = {
        name: 'Consultoria',
        description: 'Serviço de consultoria',
        defaultPrice: 150.0,
        estimatedDuration: 60,
      };

      mockPrismaService.service.create.mockResolvedValue(mockService);

      const result = await service.create(createDto);

      expect(tenantContext.getTenantId).toHaveBeenCalled();
      expect(prismaService.service.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          tenantId: mockTenantId,
          status: 'active',
        },
      });
      expect(result).toEqual(mockService);
    });

    it('should create a service with custom status', async () => {
      const createDto: CreateServiceDto = {
        name: 'Consultoria',
        description: 'Serviço de consultoria',
        defaultPrice: 150.0,
        estimatedDuration: 60,
        status: 'inactive',
      };

      mockPrismaService.service.create.mockResolvedValue({
        ...mockService,
        status: 'inactive',
      });

      await service.create(createDto);

      expect(prismaService.service.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          tenantId: mockTenantId,
          status: 'inactive',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated services', async () => {
      const mockServices = [mockService];
      const total = 1;

      mockPrismaService.service.findMany.mockResolvedValue(mockServices);
      mockPrismaService.service.count.mockResolvedValue(total);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: mockServices,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should apply search filter', async () => {
      mockPrismaService.service.findMany.mockResolvedValue([mockService]);
      mockPrismaService.service.count.mockResolvedValue(1);

      await service.findAll(1, 10, 'Consultoria');

      expect(prismaService.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'Consultoria', mode: 'insensitive' } },
              { description: { contains: 'Consultoria', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('should apply status filter', async () => {
      mockPrismaService.service.findMany.mockResolvedValue([mockService]);
      mockPrismaService.service.count.mockResolvedValue(1);

      await service.findAll(1, 10, undefined, 'active');

      expect(prismaService.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
          }),
        }),
      );
    });

    it('should calculate pagination correctly', async () => {
      mockPrismaService.service.findMany.mockResolvedValue([]);
      mockPrismaService.service.count.mockResolvedValue(25);

      const result = await service.findAll(2, 10);

      expect(prismaService.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page 2 - 1) * 10
          take: 10,
        }),
      );
      expect(result.meta.totalPages).toBe(3); // Math.ceil(25 / 10)
    });
  });

  describe('findOne', () => {
    it('should return a service by id', async () => {
      mockPrismaService.service.findUnique.mockResolvedValue(mockService);

      const result = await service.findOne(mockServiceId);

      expect(prismaService.service.findUnique).toHaveBeenCalledWith({
        where: { id: mockServiceId },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockService);
    });

    it('should throw NotFoundException if service not found', async () => {
      mockPrismaService.service.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Service with ID non-existent not found',
      );
    });
  });

  describe('update', () => {
    it('should update a service', async () => {
      const updateDto: UpdateServiceDto = {
        name: 'Consultoria Atualizada',
        defaultPrice: 200.0,
      };

      mockPrismaService.service.findUnique.mockResolvedValue(mockService);
      mockPrismaService.service.update.mockResolvedValue({
        ...mockService,
        ...updateDto,
      });

      const result = await service.update(mockServiceId, updateDto);

      expect(prismaService.service.findUnique).toHaveBeenCalledWith({
        where: { id: mockServiceId },
        include: expect.any(Object),
      });
      expect(prismaService.service.update).toHaveBeenCalledWith({
        where: { id: mockServiceId },
        data: updateDto,
      });
      expect(result.name).toBe(updateDto.name);
    });

    it('should throw NotFoundException if service not found', async () => {
      mockPrismaService.service.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleStatus', () => {
    it('should toggle status from active to inactive', async () => {
      mockPrismaService.service.findUnique.mockResolvedValue(mockService);
      mockPrismaService.service.update.mockResolvedValue({
        ...mockService,
        status: 'inactive',
      });

      const result = await service.toggleStatus(mockServiceId);

      expect(prismaService.service.update).toHaveBeenCalledWith({
        where: { id: mockServiceId },
        data: { status: 'inactive' },
      });
      expect(result.status).toBe('inactive');
    });

    it('should toggle status from inactive to active', async () => {
      mockPrismaService.service.findUnique.mockResolvedValue({
        ...mockService,
        status: 'inactive',
      });
      mockPrismaService.service.update.mockResolvedValue({
        ...mockService,
        status: 'active',
      });

      const result = await service.toggleStatus(mockServiceId);

      expect(prismaService.service.update).toHaveBeenCalledWith({
        where: { id: mockServiceId },
        data: { status: 'active' },
      });
      expect(result.status).toBe('active');
    });
  });

  describe('remove', () => {
    it('should remove a service if not in use', async () => {
      mockPrismaService.service.findUnique.mockResolvedValue(mockService);
      mockPrismaService.quotationItem.count.mockResolvedValue(0);
      mockPrismaService.orderItem.count.mockResolvedValue(0);
      mockPrismaService.service.delete.mockResolvedValue(mockService);

      const result = await service.remove(mockServiceId);

      expect(prismaService.quotationItem.count).toHaveBeenCalledWith({
        where: { serviceId: mockServiceId },
      });
      expect(prismaService.orderItem.count).toHaveBeenCalledWith({
        where: { serviceId: mockServiceId },
      });
      expect(prismaService.service.delete).toHaveBeenCalledWith({
        where: { id: mockServiceId },
      });
      expect(result).toEqual(mockService);
    });

    it('should throw BadRequestException if service is in use in quotations', async () => {
      mockPrismaService.service.findUnique.mockResolvedValue(mockService);
      mockPrismaService.quotationItem.count.mockResolvedValue(3);
      mockPrismaService.orderItem.count.mockResolvedValue(0);

      await expect(service.remove(mockServiceId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.remove(mockServiceId)).rejects.toThrow(
        /3 orçamento\(s\)/,
      );
    });

    it('should throw BadRequestException if service is in use in orders', async () => {
      mockPrismaService.service.findUnique.mockResolvedValue(mockService);
      mockPrismaService.quotationItem.count.mockResolvedValue(0);
      mockPrismaService.orderItem.count.mockResolvedValue(2);

      await expect(service.remove(mockServiceId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.remove(mockServiceId)).rejects.toThrow(
        /2 ordem\(ns\)/,
      );
    });

    it('should throw NotFoundException if service not found', async () => {
      mockPrismaService.service.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findActive', () => {
    it('should return only active services', async () => {
      const activeServices = [mockService];
      mockPrismaService.service.findMany.mockResolvedValue(activeServices);

      const result = await service.findActive();

      expect(prismaService.service.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenantId,
          status: 'active',
        },
        select: {
          id: true,
          name: true,
          description: true,
          defaultPrice: true,
          estimatedDuration: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
      expect(result).toEqual(activeServices);
    });
  });

  describe('findMostUsed', () => {
    it('should return most used services ordered by usage count', async () => {
      const mostUsedServices = [
        { ...mockService, _count: { orderItems: 10 } },
        { ...mockService, id: 'service-2', _count: { orderItems: 5 } },
      ];
      mockPrismaService.service.findMany.mockResolvedValue(mostUsedServices);

      const result = await service.findMostUsed(10);

      expect(prismaService.service.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenantId,
          status: 'active',
        },
        include: {
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
        orderBy: {
          orderItems: {
            _count: 'desc',
          },
        },
        take: 10,
      });
      expect(result).toEqual(mostUsedServices);
    });

    it('should accept custom limit parameter', async () => {
      mockPrismaService.service.findMany.mockResolvedValue([]);

      await service.findMostUsed(5);

      expect(prismaService.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        }),
      );
    });
  });
});
