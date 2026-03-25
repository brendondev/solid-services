import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import {
  CreateReceivableDto,
  CreatePaymentDto,
  UpdateReceivableDto,
  CreatePayableDto,
} from './dto';

describe('FinancialService', () => {
  let service: FinancialService;
  let prismaService: PrismaService;
  let tenantContext: TenantContextService;

  const mockTenantId = 'tenant-123';
  const mockReceivableId = 'receivable-456';
  const mockCustomerId = 'customer-789';
  const mockOrderId = 'order-111';
  const mockUserId = 'user-222';

  const mockReceivable = {
    id: mockReceivableId,
    tenantId: mockTenantId,
    customerId: mockCustomerId,
    serviceOrderId: mockOrderId,
    amount: 300.0,
    paidAmount: 0.0,
    status: 'pending',
    dueDate: new Date('2026-12-31'),
    paidAt: null,
    notes: 'Test receivable',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    receivable: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      aggregate: jest.fn(),
    },
    serviceOrder: {
      findFirst: jest.fn(),
    },
    payable: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    payablePayment: {
      create: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  const mockTenantContextService = {
    getTenantId: jest.fn().mockReturnValue(mockTenantId),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialService,
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

    service = module.get<FinancialService>(FinancialService);
    prismaService = module.get<PrismaService>(PrismaService);
    tenantContext = module.get<TenantContextService>(TenantContextService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReceivable', () => {
    it('should create a new receivable', async () => {
      const createDto: CreateReceivableDto = {
        customerId: mockCustomerId,
        serviceOrderId: mockOrderId,
        amount: 300.0,
        dueDate: '2026-12-31',
        notes: 'Test receivable',
      };

      mockPrismaService.receivable.create.mockResolvedValue(mockReceivable);

      const result = await service.createReceivable(createDto);

      expect(tenantContext.getTenantId).toHaveBeenCalled();
      expect(prismaService.receivable.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: mockTenantId,
          customerId: mockCustomerId,
          serviceOrderId: mockOrderId,
          amount: 300.0,
          dueDate: expect.any(Date),
          status: 'pending',
          paidAmount: 0,
        }),
        include: expect.any(Object),
      });
      expect(result).toEqual(mockReceivable);
    });
  });

  describe('createFromServiceOrder', () => {
    it('should create receivable from completed service order', async () => {
      const mockOrder = {
        id: mockOrderId,
        customerId: mockCustomerId,
        number: 'OS-2026-001',
        status: 'completed',
        totalAmount: 300.0,
      };

      mockPrismaService.serviceOrder.findFirst.mockResolvedValue(mockOrder);
      mockPrismaService.receivable.findFirst.mockResolvedValue(null);
      mockPrismaService.receivable.create.mockResolvedValue(mockReceivable);

      const result = await service.createFromServiceOrder(mockOrderId);

      expect(prismaService.serviceOrder.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockOrderId,
          tenantId: mockTenantId,
          status: 'completed',
        },
      });
      expect(prismaService.receivable.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: mockTenantId,
            serviceOrderId: mockOrder.id,
            customerId: mockOrder.customerId,
            amount: mockOrder.totalAmount,
            paidAmount: 0,
            status: 'pending',
            notes: `Referente à ${mockOrder.number}`,
          }),
        }),
      );
      expect(result).toEqual(mockReceivable);
    });

    it('should throw NotFoundException if order not found or not completed', async () => {
      mockPrismaService.serviceOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.createFromServiceOrder('non-existent'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.createFromServiceOrder('non-existent'),
      ).rejects.toThrow('Completed service order not found');
    });

    it('should throw BadRequestException if receivable already exists', async () => {
      mockPrismaService.serviceOrder.findFirst.mockResolvedValue({
        id: mockOrderId,
        status: 'completed',
      });
      mockPrismaService.receivable.findFirst.mockResolvedValue(
        mockReceivable,
      );

      await expect(
        service.createFromServiceOrder(mockOrderId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createFromServiceOrder(mockOrderId),
      ).rejects.toThrow('already exists');
    });
  });

  describe('findAllReceivables', () => {
    it('should return paginated receivables', async () => {
      const mockReceivables = [mockReceivable];
      mockPrismaService.receivable.findMany.mockResolvedValue(
        mockReceivables,
      );
      mockPrismaService.receivable.count.mockResolvedValue(1);

      const result = await service.findAllReceivables(1, 10);

      expect(result).toEqual({
        data: mockReceivables,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should apply status filter', async () => {
      mockPrismaService.receivable.findMany.mockResolvedValue([]);
      mockPrismaService.receivable.count.mockResolvedValue(0);

      await service.findAllReceivables(1, 10, 'paid');

      expect(prismaService.receivable.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'paid',
          }),
        }),
      );
    });

    it('should filter overdue receivables', async () => {
      mockPrismaService.receivable.findMany.mockResolvedValue([]);
      mockPrismaService.receivable.count.mockResolvedValue(0);

      await service.findAllReceivables(1, 10, undefined, true);

      expect(prismaService.receivable.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'pending',
            dueDate: {
              lt: expect.any(Date),
            },
          }),
        }),
      );
    });
  });

  describe('findOneReceivable', () => {
    it('should return a receivable by id', async () => {
      mockPrismaService.receivable.findUnique.mockResolvedValue(
        mockReceivable,
      );

      const result = await service.findOneReceivable(mockReceivableId);

      expect(prismaService.receivable.findUnique).toHaveBeenCalledWith({
        where: { id: mockReceivableId },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockReceivable);
    });

    it('should throw NotFoundException if receivable not found', async () => {
      mockPrismaService.receivable.findUnique.mockResolvedValue(null);

      await expect(service.findOneReceivable('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateReceivable', () => {
    it('should update a receivable', async () => {
      const updateDto: UpdateReceivableDto = {
        notes: 'Updated notes',
        dueDate: '2027-01-31',
      };

      mockPrismaService.receivable.findUnique.mockResolvedValue(
        mockReceivable,
      );
      mockPrismaService.receivable.update.mockResolvedValue({
        ...mockReceivable,
        ...updateDto,
      });

      const result = await service.updateReceivable(
        mockReceivableId,
        updateDto,
      );

      expect(prismaService.receivable.update).toHaveBeenCalledWith({
        where: { id: mockReceivableId },
        data: expect.objectContaining({
          notes: updateDto.notes,
          dueDate: expect.any(Date),
        }),
        include: expect.any(Object),
      });
      expect(result.notes).toBe(updateDto.notes);
    });
  });

  describe('registerPayment', () => {
    it('should register a payment and update receivable status', async () => {
      const paymentDto: CreatePaymentDto = {
        amount: 150.0,
        method: 'pix',
        paidAt: '2026-12-01',
        notes: 'Partial payment',
      };

      const mockPayment = {
        id: 'payment-1',
        receivableId: mockReceivableId,
        amount: 150.0,
        method: 'pix',
        paidAt: new Date('2026-12-01'),
        registeredBy: mockUserId,
      };

      mockPrismaService.receivable.findUnique.mockResolvedValue(
        mockReceivable,
      );
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);
      mockPrismaService.receivable.update.mockResolvedValue({
        ...mockReceivable,
        paidAmount: 150.0,
        status: 'partial',
      });

      const result = await service.registerPayment(
        mockReceivableId,
        paymentDto,
        mockUserId,
      );

      expect(prismaService.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          receivableId: mockReceivableId,
          amount: 150.0,
          method: 'pix',
          registeredBy: mockUserId,
        }),
        include: expect.any(Object),
      });

      expect(prismaService.receivable.update).toHaveBeenCalledWith({
        where: { id: mockReceivableId },
        data: {
          paidAmount: 150.0,
          status: 'partial',
          paidAt: null,
        },
      });

      expect(result).toEqual(mockPayment);
    });

    it('should mark receivable as paid when payment completes total', async () => {
      const paymentDto: CreatePaymentDto = {
        amount: 300.0,
        method: 'pix',
        paidAt: '2026-12-01',
      };

      mockPrismaService.receivable.findUnique.mockResolvedValue(
        mockReceivable,
      );
      mockPrismaService.payment.create.mockResolvedValue({});
      mockPrismaService.receivable.update.mockResolvedValue({
        ...mockReceivable,
        paidAmount: 300.0,
        status: 'paid',
      });

      await service.registerPayment(
        mockReceivableId,
        paymentDto,
        mockUserId,
      );

      expect(prismaService.receivable.update).toHaveBeenCalledWith({
        where: { id: mockReceivableId },
        data: {
          paidAmount: 300.0,
          status: 'paid',
          paidAt: expect.any(Date),
        },
      });
    });

    it('should throw BadRequestException if payment exceeds pending amount', async () => {
      const paymentDto: CreatePaymentDto = {
        amount: 500.0,
        method: 'pix',
        paidAt: '2026-12-01',
      };

      mockPrismaService.receivable.findUnique.mockResolvedValue(
        mockReceivable,
      );

      await expect(
        service.registerPayment(mockReceivableId, paymentDto, mockUserId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.registerPayment(mockReceivableId, paymentDto, mockUserId),
      ).rejects.toThrow('exceeds pending amount');
    });
  });

  describe('removeReceivable', () => {
    it('should remove receivable if no payments registered', async () => {
      mockPrismaService.receivable.findUnique.mockResolvedValue(
        mockReceivable,
      );
      mockPrismaService.receivable.delete.mockResolvedValue(mockReceivable);

      const result = await service.removeReceivable(mockReceivableId);

      expect(prismaService.receivable.delete).toHaveBeenCalledWith({
        where: { id: mockReceivableId },
      });
      expect(result).toEqual(mockReceivable);
    });

    it('should throw BadRequestException if receivable has payments', async () => {
      mockPrismaService.receivable.findUnique.mockResolvedValue({
        ...mockReceivable,
        paidAmount: 100.0,
      });

      await expect(
        service.removeReceivable(mockReceivableId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.removeReceivable(mockReceivableId),
      ).rejects.toThrow('with payments');
    });
  });

  describe('findByCustomer', () => {
    it('should return receivables for a specific customer', async () => {
      const mockReceivables = [mockReceivable];
      mockPrismaService.receivable.findMany.mockResolvedValue(
        mockReceivables,
      );

      const result = await service.findByCustomer(mockCustomerId);

      expect(prismaService.receivable.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenantId,
          customerId: mockCustomerId,
        },
        include: expect.any(Object),
        orderBy: {
          dueDate: 'desc',
        },
      });
      expect(result).toEqual(mockReceivables);
    });
  });

  describe('createPayable', () => {
    it('should create a new payable', async () => {
      const createDto: CreatePayableDto = {
        supplierId: 'supplier-1',
        description: 'Test payable description',
        amount: 500.0,
        dueDate: '2026-12-31',
        notes: 'Test payable',
      };

      const mockPayable = {
        id: 'payable-1',
        tenantId: mockTenantId,
        supplierId: 'supplier-1',
        amount: 500.0,
        paidAmount: 0.0,
        status: 'pending',
        dueDate: new Date('2026-12-31'),
      };

      mockPrismaService.payable.create.mockResolvedValue(mockPayable);

      const result = await service.createPayable(createDto);

      expect(prismaService.payable.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: mockTenantId,
          supplierId: 'supplier-1',
          amount: 500.0,
          status: 'pending',
          paidAmount: 0,
        }),
        include: expect.any(Object),
      });
      expect(result).toEqual(mockPayable);
    });
  });

  describe('getDashboard', () => {
    it('should return financial dashboard with metrics', async () => {
      // Mock receivables aggregates
      mockPrismaService.receivable.aggregate.mockImplementation((args) => {
        if (args.where?.status) {
          return Promise.resolve({
            _sum: { amount: 1000, paidAmount: 200 },
          });
        }
        return Promise.resolve({ _sum: { amount: 300, paidAmount: 0 } });
      });

      mockPrismaService.receivable.count.mockResolvedValue(2);

      // Mock payment aggregates
      mockPrismaService.payment.aggregate.mockResolvedValue({
        _sum: { amount: 500 },
      });

      // Mock payables aggregates
      mockPrismaService.payable.aggregate.mockImplementation((args) => {
        if (args.where?.status) {
          return Promise.resolve({
            _sum: { amount: 600, paidAmount: 100 },
          });
        }
        return Promise.resolve({ _sum: { amount: 200, paidAmount: 0 } });
      });

      mockPrismaService.payable.count.mockResolvedValue(1);

      // Mock payable payment aggregates
      mockPrismaService.payablePayment.aggregate.mockResolvedValue({
        _sum: { amount: 300 },
      });

      const result = await service.getDashboard();

      expect(result).toHaveProperty('receivables');
      expect(result).toHaveProperty('payables');
      expect(result).toHaveProperty('cashFlow');
      expect(result.receivables).toHaveProperty('pending');
      expect(result.receivables).toHaveProperty('receivedThisMonth');
      expect(result.payables).toHaveProperty('pending');
      expect(result.cashFlow).toHaveProperty('currentBalance');
      expect(result.cashFlow).toHaveProperty('monthlyProfit');
    });
  });
});
