import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { StorageService } from '@core/storage';
import {
  CreateServiceOrderDto,
  UpdateServiceOrderDto,
  UpdateChecklistItemDto,
} from './dto';

describe('ServiceOrdersService', () => {
  let service: ServiceOrdersService;
  let prismaService: PrismaService;
  let tenantContext: TenantContextService;

  const mockTenantId = 'tenant-123';
  const mockOrderId = 'order-456';
  const mockCustomerId = 'customer-789';
  const mockQuotationId = 'quotation-111';

  const mockOrder = {
    id: mockOrderId,
    tenantId: mockTenantId,
    customerId: mockCustomerId,
    quotationId: mockQuotationId,
    number: 'OS-2026-001',
    status: 'open',
    assignedTo: null,
    scheduledFor: null,
    startedAt: null,
    completedAt: null,
    totalAmount: 300.0,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    serviceOrder: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    quotation: {
      findFirst: jest.fn(),
    },
    orderChecklist: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    orderTimeline: {
      create: jest.fn(),
    },
    receivable: {
      findMany: jest.fn(),
    },
    attachment: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockTenantContextService = {
    getTenantId: jest.fn().mockReturnValue(mockTenantId),
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
    validateFileSize: jest.fn(),
    validateFileExtension: jest.fn(),
    getSignedDownloadUrl: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TenantContextService,
          useValue: mockTenantContextService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<ServiceOrdersService>(ServiceOrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
    tenantContext = module.get<TenantContextService>(TenantContextService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new service order with items', async () => {
      const createDto: CreateServiceOrderDto = {
        customerId: mockCustomerId,
        quotationId: mockQuotationId,
        items: [
          {
            serviceId: 'service-1',
            description: 'Consultoria',
            quantity: 2,
            unitPrice: 150.0,
            order: 1,
          },
        ],
        notes: 'Test order',
      };

      mockPrismaService.serviceOrder.count.mockResolvedValue(0);
      mockPrismaService.serviceOrder.create.mockResolvedValue(mockOrder);

      const result = await service.create(createDto);

      expect(tenantContext.getTenantId).toHaveBeenCalled();
      expect(prismaService.serviceOrder.count).toHaveBeenCalled();
      expect(prismaService.serviceOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: mockTenantId,
            customerId: mockCustomerId,
            status: 'open',
            totalAmount: 300.0,
            items: {
              create: expect.arrayContaining([
                expect.objectContaining({
                  quantity: 2,
                  unitPrice: 150.0,
                  totalPrice: 300.0,
                }),
              ]),
            },
            timeline: {
              create: expect.arrayContaining([
                expect.objectContaining({
                  event: 'created',
                }),
              ]),
            },
          }),
        }),
      );
      expect(result).toEqual(mockOrder);
    });

    it('should set status to scheduled if scheduledFor is provided', async () => {
      const createDto: CreateServiceOrderDto = {
        customerId: mockCustomerId,
        scheduledFor: '2026-12-31T10:00:00Z',
        items: [
          {
            serviceId: 'service-1',
            description: 'Consultoria',
            quantity: 1,
            unitPrice: 100.0,
            order: 1,
          },
        ],
      };

      mockPrismaService.serviceOrder.count.mockResolvedValue(0);
      mockPrismaService.serviceOrder.create.mockResolvedValue({
        ...mockOrder,
        status: 'scheduled',
      });

      await service.create(createDto);

      expect(prismaService.serviceOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'scheduled',
            scheduledFor: expect.any(Date),
          }),
        }),
      );
    });

    it('should generate sequential order numbers', async () => {
      const createDto: CreateServiceOrderDto = {
        customerId: mockCustomerId,
        items: [
          {
            serviceId: 'service-1',
            description: 'Test',
            quantity: 1,
            unitPrice: 100.0,
            order: 1,
          },
        ],
      };

      mockPrismaService.serviceOrder.count.mockResolvedValue(5);
      mockPrismaService.serviceOrder.create.mockResolvedValue(mockOrder);

      await service.create(createDto);

      const year = new Date().getFullYear();
      expect(prismaService.serviceOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            number: `OS-${year}-006`,
          }),
        }),
      );
    });

    it('should create with checklist items if provided', async () => {
      const createDto: CreateServiceOrderDto = {
        customerId: mockCustomerId,
        items: [
          {
            serviceId: 'service-1',
            description: 'Test',
            quantity: 1,
            unitPrice: 100.0,
            order: 1,
          },
        ],
        checklists: [
          { title: 'Task 1', order: 1 },
          { title: 'Task 2', order: 2 },
        ],
      };

      mockPrismaService.serviceOrder.count.mockResolvedValue(0);
      mockPrismaService.serviceOrder.create.mockResolvedValue(mockOrder);

      await service.create(createDto);

      expect(prismaService.serviceOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            checklists: {
              create: expect.arrayContaining([
                expect.objectContaining({
                  title: 'Task 1',
                  isCompleted: false,
                }),
              ]),
            },
          }),
        }),
      );
    });
  });

  describe('createFromQuotation', () => {
    it('should create order from approved quotation', async () => {
      const mockQuotation = {
        id: mockQuotationId,
        customerId: mockCustomerId,
        number: 'QT-2026-001',
        status: 'approved',
        totalAmount: 300.0,
        items: [
          {
            serviceId: 'service-1',
            description: 'Consultoria',
            quantity: 2,
            unitPrice: 150.0,
            totalPrice: 300.0,
          },
        ],
      };

      mockPrismaService.quotation.findFirst.mockResolvedValue(mockQuotation);
      mockPrismaService.serviceOrder.findFirst.mockResolvedValue(null);
      mockPrismaService.serviceOrder.count.mockResolvedValue(0);
      mockPrismaService.serviceOrder.create.mockResolvedValue(mockOrder);

      const result = await service.createFromQuotation(mockQuotationId);

      expect(prismaService.quotation.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: mockQuotationId,
            status: 'approved',
          }),
        }),
      );
      expect(prismaService.serviceOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerId: mockCustomerId,
            quotationId: mockQuotationId,
            status: 'open',
            totalAmount: mockQuotation.totalAmount,
          }),
        }),
      );
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if quotation not found or not approved', async () => {
      mockPrismaService.quotation.findFirst.mockResolvedValue(null);

      await expect(
        service.createFromQuotation('non-existent'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.createFromQuotation('non-existent'),
      ).rejects.toThrow('Approved quotation not found');
    });

    it('should throw BadRequestException if order already exists for quotation', async () => {
      mockPrismaService.quotation.findFirst.mockResolvedValue({
        id: mockQuotationId,
        status: 'approved',
      });
      mockPrismaService.serviceOrder.findFirst.mockResolvedValue(mockOrder);

      await expect(
        service.createFromQuotation(mockQuotationId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createFromQuotation(mockQuotationId),
      ).rejects.toThrow('already exists');
    });
  });

  describe('findAll', () => {
    it('should return paginated service orders', async () => {
      const mockOrders = [mockOrder];
      mockPrismaService.serviceOrder.findMany.mockResolvedValue(mockOrders);
      mockPrismaService.serviceOrder.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: mockOrders,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should apply search filter', async () => {
      mockPrismaService.serviceOrder.findMany.mockResolvedValue([]);
      mockPrismaService.serviceOrder.count.mockResolvedValue(0);

      await service.findAll(1, 10, 'OS-2026');

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('should apply status filter', async () => {
      mockPrismaService.serviceOrder.findMany.mockResolvedValue([]);
      mockPrismaService.serviceOrder.count.mockResolvedValue(0);

      await service.findAll(1, 10, undefined, 'in_progress');

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'in_progress',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a service order by id', async () => {
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOne(mockOrderId);

      expect(prismaService.serviceOrder.findUnique).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a service order', async () => {
      const updateDto: UpdateServiceOrderDto = {
        notes: 'Updated notes',
        assignedTo: 'user-123',
      };

      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.serviceOrder.update.mockResolvedValue({
        ...mockOrder,
        ...updateDto,
      });

      const result = await service.update(mockOrderId, updateDto);

      expect(prismaService.serviceOrder.update).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        data: expect.objectContaining(updateDto),
        include: expect.any(Object),
      });
      expect(result.notes).toBe(updateDto.notes);
    });
  });

  describe('updateStatus', () => {
    it('should update order status and add timeline event', async () => {
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.serviceOrder.update.mockResolvedValue({
        ...mockOrder,
        status: 'in_progress',
        startedAt: new Date(),
      });

      const result = await service.updateStatus(
        mockOrderId,
        'in_progress',
        'Work started',
      );

      expect(prismaService.serviceOrder.update).toHaveBeenCalledWith({
        where: { id: mockOrderId },
        data: expect.objectContaining({
          status: 'in_progress',
          startedAt: expect.any(Date),
          timeline: {
            create: expect.objectContaining({
              event: 'in_progress',
              description: 'Work started',
            }),
          },
        }),
        include: expect.any(Object),
      });
      expect(result.status).toBe('in_progress');
    });

    it('should set completedAt when status changes to completed', async () => {
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.serviceOrder.update.mockResolvedValue({
        ...mockOrder,
        status: 'completed',
        completedAt: new Date(),
      });

      await service.updateStatus(mockOrderId, 'completed');

      expect(prismaService.serviceOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            completedAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('addChecklistItem', () => {
    it('should add item to checklist', async () => {
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.orderChecklist.findFirst.mockResolvedValue(null);
      mockPrismaService.orderChecklist.create.mockResolvedValue({
        id: 'check-1',
        title: 'New task',
        order: 1,
        isCompleted: false,
      });

      const result = await service.addChecklistItem(mockOrderId, 'New task');

      expect(prismaService.orderChecklist.create).toHaveBeenCalledWith({
        data: {
          serviceOrderId: mockOrderId,
          title: 'New task',
          order: 1,
          isCompleted: false,
        },
      });
      expect(result.title).toBe('New task');
    });

    it('should increment order based on last item', async () => {
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.orderChecklist.findFirst.mockResolvedValue({
        order: 5,
      });
      mockPrismaService.orderChecklist.create.mockResolvedValue({
        id: 'check-2',
        title: 'Another task',
        order: 6,
      });

      await service.addChecklistItem(mockOrderId, 'Another task');

      expect(prismaService.orderChecklist.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            order: 6,
          }),
        }),
      );
    });
  });

  describe('updateChecklistItem', () => {
    it('should mark checklist item as completed', async () => {
      const dto: UpdateChecklistItemDto = { isCompleted: true };

      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.orderChecklist.update.mockResolvedValue({
        id: 'check-1',
        isCompleted: true,
        completedAt: new Date(),
      });

      const result = await service.updateChecklistItem(
        mockOrderId,
        'check-1',
        dto,
      );

      expect(prismaService.orderChecklist.update).toHaveBeenCalledWith({
        where: { id: 'check-1' },
        data: expect.objectContaining({
          isCompleted: true,
          completedAt: expect.any(Date),
        }),
      });
      expect(result.isCompleted).toBe(true);
    });

    it('should unmark checklist item and clear completedAt', async () => {
      const dto: UpdateChecklistItemDto = { isCompleted: false };

      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.orderChecklist.update.mockResolvedValue({
        id: 'check-1',
        isCompleted: false,
        completedAt: null,
      });

      await service.updateChecklistItem(mockOrderId, 'check-1', dto);

      expect(prismaService.orderChecklist.update).toHaveBeenCalledWith({
        where: { id: 'check-1' },
        data: expect.objectContaining({
          isCompleted: false,
          completedAt: null,
        }),
      });
    });
  });

  describe('addTimelineEvent', () => {
    it('should add event to timeline', async () => {
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.orderTimeline.create.mockResolvedValue({
        id: 'timeline-1',
        event: 'custom_event',
        description: 'Custom event description',
      });

      const result = await service.addTimelineEvent(
        mockOrderId,
        'custom_event',
        'Custom event description',
      );

      expect(prismaService.orderTimeline.create).toHaveBeenCalledWith({
        data: {
          serviceOrderId: mockOrderId,
          event: 'custom_event',
          description: 'Custom event description',
          metadata: undefined,
        },
      });
      expect(result.event).toBe('custom_event');
    });
  });

  describe('remove', () => {
    it('should remove order if not completed and no receivables', async () => {
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.receivable.findMany.mockResolvedValue([]);
      mockPrismaService.serviceOrder.delete.mockResolvedValue(mockOrder);

      const result = await service.remove(mockOrderId);

      expect(prismaService.serviceOrder.delete).toHaveBeenCalledWith({
        where: { id: mockOrderId },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw BadRequestException if order is completed', async () => {
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'completed',
      });

      await expect(service.remove(mockOrderId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.remove(mockOrderId)).rejects.toThrow(
        /concluída/,
      );
    });

    it('should throw BadRequestException if order has receivables', async () => {
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.receivable.findMany.mockResolvedValue([
        {
          id: 'rec-1',
          notes: 'Payment 1',
          amount: 150,
          status: 'pending',
        },
      ]);

      await expect(service.remove(mockOrderId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findScheduled', () => {
    it('should return orders scheduled for a specific date', async () => {
      const date = new Date('2026-12-25');
      const scheduledOrders = [
        { ...mockOrder, scheduledFor: new Date('2026-12-25T10:00:00Z') },
      ];

      mockPrismaService.serviceOrder.findMany.mockResolvedValue(
        scheduledOrders,
      );

      const result = await service.findScheduled(date);

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            scheduledFor: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
            status: {
              in: ['scheduled', 'in_progress'],
            },
          }),
        }),
      );
      expect(result).toEqual(scheduledOrders);
    });
  });

  describe('findByTechnician', () => {
    it('should return orders assigned to a technician', async () => {
      const technicianId = 'tech-123';
      const techOrders = [{ ...mockOrder, assignedTo: technicianId }];

      mockPrismaService.serviceOrder.findMany.mockResolvedValue(techOrders);

      const result = await service.findByTechnician(technicianId);

      expect(prismaService.serviceOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assignedTo: technicianId,
            status: {
              in: ['scheduled', 'in_progress'],
            },
          }),
        }),
      );
      expect(result).toEqual(techOrders);
    });
  });
});
