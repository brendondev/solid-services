import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';

describe('CustomersService', () => {
  let service: CustomersService;
  let prismaService: PrismaService;
  let tenantContext: TenantContextService;

  const mockTenantId = 'tenant-123';
  const mockCustomerId = 'customer-456';

  const mockCustomer = {
    id: mockCustomerId,
    tenantId: mockTenantId,
    name: 'João Silva',
    type: 'individual' as const,
    document: '12345678900',
    status: 'active',
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    contacts: [],
    addresses: [],
  };

  const mockPrismaService = {
    customer: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    quotation: {
      findMany: jest.fn(),
    },
    serviceOrder: {
      findMany: jest.fn(),
    },
    receivable: {
      findMany: jest.fn(),
    },
  };

  const mockTenantContextService = {
    getTenantId: jest.fn().mockReturnValue(mockTenantId),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
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

    service = module.get<CustomersService>(CustomersService);
    prismaService = module.get<PrismaService>(PrismaService);
    tenantContext = module.get<TenantContextService>(TenantContextService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new customer with contacts and addresses', async () => {
      const createDto: CreateCustomerDto = {
        name: 'João Silva',
        type: 'individual',
        document: '12345678900',
        contacts: [
          {
            name: 'Maria Silva',
            phone: '11988888888',
            email: 'maria@example.com',
            isPrimary: true,
          },
        ],
        addresses: [
          {
            street: 'Rua A',
            number: '123',
            district: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01000000',
            isPrimary: true,
          },
        ],
      };

      const mockResult = {
        ...mockCustomer,
        contacts: createDto.contacts,
        addresses: createDto.addresses,
      };

      mockPrismaService.customer.create.mockResolvedValue(mockResult);

      const result = await service.create(createDto);

      expect(tenantContext.getTenantId).toHaveBeenCalled();
      expect(prismaService.customer.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name,
          type: createDto.type,
          document: createDto.document,
          tenantId: mockTenantId,
          status: 'active',
          contacts: {
            create: createDto.contacts,
          },
          addresses: {
            create: createDto.addresses,
          },
        },
        include: {
          contacts: true,
          addresses: true,
        },
      });
      expect(result).toEqual(mockResult);
    });

    it('should create a customer without contacts and addresses', async () => {
      const createDto: CreateCustomerDto = {
        name: 'João Silva',
        type: 'individual',
        document: '12345678900',
      };

      mockPrismaService.customer.create.mockResolvedValue(mockCustomer);

      await service.create(createDto);

      expect(prismaService.customer.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name,
          type: createDto.type,
          document: createDto.document,
          tenantId: mockTenantId,
          status: 'active',
          contacts: { create: [] },
          addresses: { create: [] },
        },
        include: {
          contacts: true,
          addresses: true,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated customers', async () => {
      const mockCustomers = [mockCustomer];
      const total = 1;

      mockPrismaService.customer.findMany.mockResolvedValue(mockCustomers);
      mockPrismaService.customer.count.mockResolvedValue(total);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: mockCustomers,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should apply search filter', async () => {
      mockPrismaService.customer.findMany.mockResolvedValue([mockCustomer]);
      mockPrismaService.customer.count.mockResolvedValue(1);

      await service.findAll(1, 10, 'João');

      expect(prismaService.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'João', mode: 'insensitive' } },
              { document: { contains: 'João', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('should calculate pagination correctly', async () => {
      mockPrismaService.customer.findMany.mockResolvedValue([]);
      mockPrismaService.customer.count.mockResolvedValue(25);

      const result = await service.findAll(2, 10);

      expect(prismaService.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.meta.totalPages).toBe(3);
    });

    it('should include counts of quotations and orders', async () => {
      mockPrismaService.customer.findMany.mockResolvedValue([]);
      mockPrismaService.customer.count.mockResolvedValue(0);

      await service.findAll(1, 10);

      expect(prismaService.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: {
              select: {
                quotations: true,
                serviceOrders: true,
              },
            },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a customer by id with relationships', async () => {
      const mockResult = {
        ...mockCustomer,
        quotations: [],
        serviceOrders: [],
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockResult);

      const result = await service.findOne(mockCustomerId);

      expect(prismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { id: mockCustomerId },
        include: {
          contacts: true,
          addresses: true,
          quotations: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
          serviceOrders: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Customer with ID non-existent not found',
      );
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const updateDto: UpdateCustomerDto = {
        name: 'João Silva Atualizado',
        notes: 'Cliente VIP',
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockCustomer,
        ...updateDto,
      });

      const result = await service.update(mockCustomerId, updateDto);

      expect(prismaService.customer.findUnique).toHaveBeenCalled();
      expect(prismaService.customer.update).toHaveBeenCalledWith({
        where: { id: mockCustomerId },
        data: updateDto,
        include: {
          contacts: true,
          addresses: true,
        },
      });
      expect(result.name).toBe(updateDto.name);
      expect(result.notes).toBe(updateDto.notes);
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a customer by setting status to inactive', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockCustomer,
        status: 'inactive',
      });

      const result = await service.remove(mockCustomerId);

      expect(prismaService.customer.update).toHaveBeenCalledWith({
        where: { id: mockCustomerId },
        data: {
          status: 'inactive',
        },
      });
      expect(result.status).toBe('inactive');
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleStatus', () => {
    it('should toggle status from active to inactive', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockCustomer,
        status: 'inactive',
      });

      const result = await service.toggleStatus(mockCustomerId);

      expect(prismaService.customer.update).toHaveBeenCalledWith({
        where: { id: mockCustomerId },
        data: { status: 'inactive' },
      });
      expect(result.status).toBe('inactive');
    });

    it('should toggle status from inactive to active', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue({
        ...mockCustomer,
        status: 'inactive',
      });
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockCustomer,
        status: 'active',
      });

      const result = await service.toggleStatus(mockCustomerId);

      expect(prismaService.customer.update).toHaveBeenCalledWith({
        where: { id: mockCustomerId },
        data: { status: 'active' },
      });
      expect(result.status).toBe('active');
    });
  });

  describe('delete', () => {
    it('should permanently delete a customer if no dependencies exist', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.quotation.findMany.mockResolvedValue([]);
      mockPrismaService.serviceOrder.findMany.mockResolvedValue([]);
      mockPrismaService.receivable.findMany.mockResolvedValue([]);
      mockPrismaService.customer.delete.mockResolvedValue(mockCustomer);

      const result = await service.delete(mockCustomerId);

      expect(prismaService.quotation.findMany).toHaveBeenCalledWith({
        where: { customerId: mockCustomerId },
        select: expect.any(Object),
        take: 5,
      });
      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith({
        where: { customerId: mockCustomerId },
        select: expect.any(Object),
        take: 5,
      });
      expect(prismaService.receivable.findMany).toHaveBeenCalledWith({
        where: { customerId: mockCustomerId },
        select: expect.any(Object),
        take: 5,
      });
      expect(prismaService.customer.delete).toHaveBeenCalledWith({
        where: { id: mockCustomerId },
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should throw BadRequestException if customer has quotations', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.quotation.findMany.mockResolvedValue([
        {
          id: 'quot-1',
          number: 'ORÇ-001',
          totalAmount: 100,
          status: 'pending',
        },
      ]);
      mockPrismaService.serviceOrder.findMany.mockResolvedValue([]);
      mockPrismaService.receivable.findMany.mockResolvedValue([]);

      await expect(service.delete(mockCustomerId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.delete(mockCustomerId)).rejects.toThrow(
        /registros vinculados/,
      );
    });

    it('should throw BadRequestException if customer has orders', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.quotation.findMany.mockResolvedValue([]);
      mockPrismaService.serviceOrder.findMany.mockResolvedValue([
        {
          id: 'order-1',
          number: 'OS-001',
          totalAmount: 200,
          status: 'open',
        },
      ]);
      mockPrismaService.receivable.findMany.mockResolvedValue([]);

      await expect(service.delete(mockCustomerId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if customer has receivables', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.quotation.findMany.mockResolvedValue([]);
      mockPrismaService.serviceOrder.findMany.mockResolvedValue([]);
      mockPrismaService.receivable.findMany.mockResolvedValue([
        {
          id: 'rec-1',
          notes: 'Pagamento OS-001',
          amount: 150,
          status: 'pending',
        },
      ]);

      await expect(service.delete(mockCustomerId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findActive', () => {
    it('should return only active customers', async () => {
      const activeCustomers = [
        {
          id: mockCustomerId,
          name: 'João Silva',
          type: 'individual',
          document: '12345678900',
        },
      ];

      mockPrismaService.customer.findMany.mockResolvedValue(activeCustomers);

      const result = await service.findActive();

      expect(prismaService.customer.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenantId,
          status: 'active',
        },
        select: {
          id: true,
          name: true,
          type: true,
          document: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
      expect(result).toEqual(activeCustomers);
    });

    it('should return empty array if no active customers', async () => {
      mockPrismaService.customer.findMany.mockResolvedValue([]);

      const result = await service.findActive();

      expect(result).toEqual([]);
    });
  });
});
