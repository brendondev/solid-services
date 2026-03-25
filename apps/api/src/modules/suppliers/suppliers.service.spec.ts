import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { CreateSupplierDto, UpdateSupplierDto } from './dto';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let prismaService: PrismaService;
  let tenantContext: TenantContextService;

  const mockTenantId = 'tenant-123';
  const mockSupplierId = 'supplier-456';

  const mockSupplier = {
    id: mockSupplierId,
    tenantId: mockTenantId,
    name: 'Supplier Inc',
    document: '12345678000100',
    email: 'supplier@example.com',
    phone: '11999999999',
    address: 'Rua A, 123',
    status: 'active',
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    supplier: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    payable: {
      findMany: jest.fn(),
    },
  };

  const mockTenantContextService = {
    getTenantId: jest.fn().mockReturnValue(mockTenantId),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
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

    service = module.get<SuppliersService>(SuppliersService);
    prismaService = module.get<PrismaService>(PrismaService);
    tenantContext = module.get<TenantContextService>(TenantContextService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new supplier', async () => {
      const createDto: CreateSupplierDto = {
        name: 'Supplier Inc',
        document: '12345678000100',
        email: 'supplier@example.com',
        phone: '11999999999',
      };

      mockPrismaService.supplier.findFirst.mockResolvedValue(null);
      mockPrismaService.supplier.create.mockResolvedValue(mockSupplier);

      const result = await service.create(createDto);

      expect(tenantContext.getTenantId).toHaveBeenCalled();
      expect(prismaService.supplier.findFirst).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenantId,
          document: createDto.document,
        },
      });
      expect(prismaService.supplier.create).toHaveBeenCalledWith({
        data: {
          tenantId: mockTenantId,
          ...createDto,
          status: 'active',
        },
      });
      expect(result).toEqual(mockSupplier);
    });

    it('should create supplier without document', async () => {
      const createDto: CreateSupplierDto = {
        name: 'Individual Supplier',
        email: 'supplier@example.com',
      };

      mockPrismaService.supplier.create.mockResolvedValue(mockSupplier);

      await service.create(createDto);

      expect(prismaService.supplier.findFirst).not.toHaveBeenCalled();
      expect(prismaService.supplier.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if document already exists', async () => {
      const createDto: CreateSupplierDto = {
        name: 'Duplicate',
        document: '12345678000100',
      };

      mockPrismaService.supplier.findFirst.mockResolvedValue(mockSupplier);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated suppliers', async () => {
      const mockSuppliers = [mockSupplier];
      mockPrismaService.supplier.findMany.mockResolvedValue(mockSuppliers);
      mockPrismaService.supplier.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: mockSuppliers,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should apply status filter', async () => {
      mockPrismaService.supplier.findMany.mockResolvedValue([]);
      mockPrismaService.supplier.count.mockResolvedValue(0);

      await service.findAll(1, 10, 'active');

      expect(prismaService.supplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
          }),
        }),
      );
    });

    it('should include payables count', async () => {
      mockPrismaService.supplier.findMany.mockResolvedValue([]);
      mockPrismaService.supplier.count.mockResolvedValue(0);

      await service.findAll(1, 10);

      expect(prismaService.supplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: {
              select: {
                payables: true,
              },
            },
          }),
        }),
      );
    });
  });

  describe('findActive', () => {
    it('should return only active suppliers', async () => {
      const activeSuppliers = [
        {
          id: mockSupplierId,
          name: 'Supplier Inc',
          document: '12345678000100',
          phone: '11999999999',
          email: 'supplier@example.com',
        },
      ];

      mockPrismaService.supplier.findMany.mockResolvedValue(activeSuppliers);

      const result = await service.findActive();

      expect(prismaService.supplier.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenantId,
          status: 'active',
        },
        select: {
          id: true,
          name: true,
          document: true,
          phone: true,
          email: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
      expect(result).toEqual(activeSuppliers);
    });
  });

  describe('findOne', () => {
    it('should return a supplier by id with payables', async () => {
      const mockResult = {
        ...mockSupplier,
        payables: [],
        _count: { payables: 0 },
      };

      mockPrismaService.supplier.findUnique.mockResolvedValue(mockResult);

      const result = await service.findOne(mockSupplierId);

      expect(prismaService.supplier.findUnique).toHaveBeenCalledWith({
        where: { id: mockSupplierId },
        include: expect.objectContaining({
          payables: expect.any(Object),
          _count: {
            select: {
              payables: true,
            },
          },
        }),
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw NotFoundException if supplier not found', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a supplier', async () => {
      const updateDto: UpdateSupplierDto = {
        name: 'Updated Supplier',
        phone: '11988888888',
      };

      mockPrismaService.supplier.findUnique.mockResolvedValue(mockSupplier);
      mockPrismaService.supplier.update.mockResolvedValue({
        ...mockSupplier,
        ...updateDto,
      });

      const result = await service.update(mockSupplierId, updateDto);

      expect(prismaService.supplier.update).toHaveBeenCalledWith({
        where: { id: mockSupplierId },
        data: updateDto,
      });
      expect(result.name).toBe(updateDto.name);
    });

    it('should validate document uniqueness when updating', async () => {
      const updateDto: UpdateSupplierDto = {
        document: '99999999000100',
      };

      mockPrismaService.supplier.findUnique.mockResolvedValue(mockSupplier);
      mockPrismaService.supplier.findFirst.mockResolvedValue(null);
      mockPrismaService.supplier.update.mockResolvedValue(mockSupplier);

      await service.update(mockSupplierId, updateDto);

      expect(prismaService.supplier.findFirst).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenantId,
          document: updateDto.document,
          id: {
            not: mockSupplierId,
          },
        },
      });
    });

    it('should throw ConflictException if document already exists for another supplier', async () => {
      const updateDto: UpdateSupplierDto = {
        document: '99999999000100',
      };

      mockPrismaService.supplier.findUnique.mockResolvedValue(mockSupplier);
      mockPrismaService.supplier.findFirst.mockResolvedValue({
        id: 'other-supplier',
      });

      await expect(
        service.update(mockSupplierId, updateDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove supplier if no payables exist', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValue({
        ...mockSupplier,
        _count: { payables: 0 },
      });
      mockPrismaService.supplier.delete.mockResolvedValue(mockSupplier);

      const result = await service.remove(mockSupplierId);

      expect(prismaService.supplier.delete).toHaveBeenCalledWith({
        where: { id: mockSupplierId },
      });
      expect(result).toEqual(mockSupplier);
    });

    it('should throw ConflictException if supplier has payables', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValue({
        ...mockSupplier,
        _count: { payables: 3 },
      });
      mockPrismaService.payable.findMany.mockResolvedValue([
        {
          id: 'payable-1',
          description: 'Payment 1',
          amount: 100,
          status: 'pending',
        },
      ]);

      await expect(service.remove(mockSupplierId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if supplier not found', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
