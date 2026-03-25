import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { NotificationsService } from '../notifications';
import { CreateQuotationDto, UpdateQuotationDto } from './dto';

describe('QuotationsService', () => {
  let service: QuotationsService;
  let prismaService: PrismaService;
  let tenantContext: TenantContextService;
  let notificationsService: NotificationsService;

  const mockTenantId = 'tenant-123';
  const mockQuotationId = 'quotation-456';
  const mockCustomerId = 'customer-789';
  const mockServiceId = 'service-111';

  const mockService = {
    id: mockServiceId,
    tenantId: mockTenantId,
    name: 'Consultoria',
    description: 'Serviço de consultoria',
    defaultPrice: 150.0,
    estimatedDuration: 60,
    status: 'active',
  };

  const mockQuotation = {
    id: mockQuotationId,
    tenantId: mockTenantId,
    customerId: mockCustomerId,
    number: 'QT-2026-001',
    status: 'draft',
    totalAmount: 300.0,
    validUntil: new Date('2026-12-31'),
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    quotation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    service: {
      findMany: jest.fn(),
    },
  };

  const mockTenantContextService = {
    getTenantId: jest.fn().mockReturnValue(mockTenantId),
  };

  const mockNotificationsService = {
    sendQuotationCreated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TenantContextService,
          useValue: mockTenantContextService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<QuotationsService>(QuotationsService);
    prismaService = module.get<PrismaService>(PrismaService);
    tenantContext = module.get<TenantContextService>(TenantContextService);
    notificationsService = module.get<NotificationsService>(
      NotificationsService,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new quotation with items', async () => {
      const createDto: CreateQuotationDto = {
        customerId: mockCustomerId,
        validUntil: '2026-12-31',
        notes: 'Test quotation',
        items: [
          {
            serviceId: mockServiceId,
            description: 'Consultoria inicial',
            quantity: 2,
            unitPrice: 150.0,
            order: 1,
          },
        ],
      };

      mockPrismaService.quotation.count.mockResolvedValue(0);
      mockPrismaService.service.findMany.mockResolvedValue([mockService]);
      mockPrismaService.quotation.create.mockResolvedValue({
        ...mockQuotation,
        number: 'QT-2026-001',
        totalAmount: 300.0,
      });

      const result = await service.create(createDto);

      expect(tenantContext.getTenantId).toHaveBeenCalled();
      expect(prismaService.quotation.count).toHaveBeenCalled();
      expect(prismaService.service.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: [mockServiceId] },
          tenantId: mockTenantId,
        },
      });
      expect(prismaService.quotation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: mockTenantId,
            customerId: mockCustomerId,
            status: 'pending',
            totalAmount: 300.0,
            items: {
              create: expect.arrayContaining([
                expect.objectContaining({
                  serviceId: mockServiceId,
                  quantity: 2,
                  unitPrice: 150.0,
                  totalPrice: 300.0,
                }),
              ]),
            },
          }),
        }),
      );
      expect(result.number).toBe('QT-2026-001');
    });

    it('should generate sequential quotation numbers', async () => {
      const createDto: CreateQuotationDto = {
        customerId: mockCustomerId,
        validUntil: '2026-12-31',
        items: [
          {
            serviceId: mockServiceId,
            quantity: 1,
            unitPrice: 100.0,
            order: 1,
          },
        ],
      };

      mockPrismaService.quotation.count.mockResolvedValue(5);
      mockPrismaService.service.findMany.mockResolvedValue([mockService]);
      mockPrismaService.quotation.create.mockResolvedValue(mockQuotation);

      await service.create(createDto);

      const year = new Date().getFullYear();
      expect(prismaService.quotation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            number: `QT-${year}-006`,
          }),
        }),
      );
    });

    it('should throw BadRequestException if service not found', async () => {
      const createDto: CreateQuotationDto = {
        customerId: mockCustomerId,
        validUntil: '2026-12-31',
        items: [
          {
            serviceId: 'non-existent',
            quantity: 1,
            unitPrice: 100.0,
            order: 1,
          },
        ],
      };

      mockPrismaService.quotation.count.mockResolvedValue(0);
      mockPrismaService.service.findMany.mockResolvedValue([]);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'One or more services not found',
      );
    });

    it('should use service description if item description is not provided', async () => {
      const createDto: CreateQuotationDto = {
        customerId: mockCustomerId,
        validUntil: '2026-12-31',
        items: [
          {
            serviceId: mockServiceId,
            quantity: 1,
            unitPrice: 100.0,
            order: 1,
          },
        ],
      };

      mockPrismaService.quotation.count.mockResolvedValue(0);
      mockPrismaService.service.findMany.mockResolvedValue([mockService]);
      mockPrismaService.quotation.create.mockResolvedValue(mockQuotation);

      await service.create(createDto);

      expect(prismaService.quotation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            items: {
              create: expect.arrayContaining([
                expect.objectContaining({
                  description: mockService.description,
                }),
              ]),
            },
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated quotations', async () => {
      const mockQuotations = [mockQuotation];
      const total = 1;

      mockPrismaService.quotation.findMany.mockResolvedValue(mockQuotations);
      mockPrismaService.quotation.count.mockResolvedValue(total);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: mockQuotations,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should apply search filter', async () => {
      mockPrismaService.quotation.findMany.mockResolvedValue([]);
      mockPrismaService.quotation.count.mockResolvedValue(0);

      await service.findAll(1, 10, 'QT-2026');

      expect(prismaService.quotation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { number: { contains: 'QT-2026', mode: 'insensitive' } },
              { customer: { name: { contains: 'QT-2026', mode: 'insensitive' } } },
            ],
          }),
        }),
      );
    });

    it('should apply status filter', async () => {
      mockPrismaService.quotation.findMany.mockResolvedValue([]);
      mockPrismaService.quotation.count.mockResolvedValue(0);

      await service.findAll(1, 10, undefined, 'approved');

      expect(prismaService.quotation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'approved',
          }),
        }),
      );
    });

    it('should calculate pagination correctly', async () => {
      mockPrismaService.quotation.findMany.mockResolvedValue([]);
      mockPrismaService.quotation.count.mockResolvedValue(25);

      const result = await service.findAll(3, 10);

      expect(prismaService.quotation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should return a quotation by id', async () => {
      mockPrismaService.quotation.findUnique.mockResolvedValue(mockQuotation);

      const result = await service.findOne(mockQuotationId);

      expect(prismaService.quotation.findUnique).toHaveBeenCalledWith({
        where: { id: mockQuotationId },
        include: expect.objectContaining({
          customer: expect.any(Object),
          items: expect.any(Object),
          serviceOrder: true,
        }),
      });
      expect(result).toEqual(mockQuotation);
    });

    it('should throw NotFoundException if quotation not found', async () => {
      mockPrismaService.quotation.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Quotation with ID non-existent not found',
      );
    });
  });

  describe('update', () => {
    it('should update a quotation', async () => {
      const updateDto: UpdateQuotationDto = {
        notes: 'Updated notes',
        validUntil: '2027-01-31',
      };

      mockPrismaService.quotation.findUnique.mockResolvedValue(mockQuotation);
      mockPrismaService.quotation.update.mockResolvedValue({
        ...mockQuotation,
        ...updateDto,
      });

      const result = await service.update(mockQuotationId, updateDto);

      expect(prismaService.quotation.findUnique).toHaveBeenCalled();
      expect(prismaService.quotation.update).toHaveBeenCalledWith({
        where: { id: mockQuotationId },
        data: expect.objectContaining({
          notes: updateDto.notes,
          validUntil: expect.any(Date),
        }),
        include: expect.any(Object),
      });
      expect(result.notes).toBe(updateDto.notes);
    });

    it('should throw NotFoundException if quotation not found', async () => {
      mockPrismaService.quotation.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { notes: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update quotation status', async () => {
      mockPrismaService.quotation.findUnique.mockResolvedValue(mockQuotation);
      mockPrismaService.quotation.update.mockResolvedValue({
        ...mockQuotation,
        status: 'approved',
      });

      const result = await service.updateStatus(mockQuotationId, 'approved');

      expect(prismaService.quotation.update).toHaveBeenCalledWith({
        where: { id: mockQuotationId },
        data: { status: 'approved' },
        include: expect.any(Object),
      });
      expect(result.status).toBe('approved');
    });

    it('should send email notification when status changes to sent', async () => {
      const quotationWithContact = {
        ...mockQuotation,
        status: 'draft',
        customer: {
          name: 'João Silva',
          contacts: [
            {
              email: 'joao@example.com',
              isPrimary: true,
            },
          ],
        },
        items: [],
      };

      mockPrismaService.quotation.findUnique.mockResolvedValue(
        quotationWithContact,
      );
      mockPrismaService.quotation.update.mockResolvedValue({
        ...quotationWithContact,
        status: 'sent',
      });
      mockNotificationsService.sendQuotationCreated.mockResolvedValue(
        undefined,
      );

      await service.updateStatus(mockQuotationId, 'sent');

      expect(notificationsService.sendQuotationCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'joao@example.com',
          customerName: 'João Silva',
          quotationNumber: mockQuotation.number,
          totalAmount: Number(mockQuotation.totalAmount),
        }),
      );
    });

    it('should not send email if status is already sent', async () => {
      const quotationAlreadySent = {
        ...mockQuotation,
        status: 'sent',
      };

      mockPrismaService.quotation.findUnique.mockResolvedValue(
        quotationAlreadySent,
      );
      mockPrismaService.quotation.update.mockResolvedValue(
        quotationAlreadySent,
      );

      await service.updateStatus(mockQuotationId, 'sent');

      expect(notificationsService.sendQuotationCreated).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a quotation if not approved', async () => {
      mockPrismaService.quotation.findUnique.mockResolvedValue(mockQuotation);
      mockPrismaService.quotation.delete.mockResolvedValue(mockQuotation);

      const result = await service.remove(mockQuotationId);

      expect(prismaService.quotation.delete).toHaveBeenCalledWith({
        where: { id: mockQuotationId },
      });
      expect(result).toEqual(mockQuotation);
    });

    it('should throw BadRequestException if quotation is approved', async () => {
      mockPrismaService.quotation.findUnique.mockResolvedValue({
        ...mockQuotation,
        status: 'approved',
      });

      await expect(service.remove(mockQuotationId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.remove(mockQuotationId)).rejects.toThrow(
        'Cannot delete approved quotation',
      );
    });

    it('should throw NotFoundException if quotation not found', async () => {
      mockPrismaService.quotation.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByCustomer', () => {
    it('should return quotations for a specific customer', async () => {
      const mockQuotations = [mockQuotation];
      mockPrismaService.quotation.findMany.mockResolvedValue(mockQuotations);

      const result = await service.findByCustomer(mockCustomerId);

      expect(prismaService.quotation.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenantId,
          customerId: mockCustomerId,
        },
        include: expect.any(Object),
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(mockQuotations);
    });
  });

  describe('findPending', () => {
    it('should return only pending quotations (draft or sent)', async () => {
      const pendingQuotations = [
        { ...mockQuotation, status: 'draft' },
        { ...mockQuotation, id: 'quot-2', status: 'sent' },
      ];

      mockPrismaService.quotation.findMany.mockResolvedValue(
        pendingQuotations,
      );

      const result = await service.findPending();

      expect(prismaService.quotation.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenantId,
          status: {
            in: ['draft', 'sent'],
          },
        },
        include: expect.any(Object),
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(pendingQuotations);
    });
  });
});
