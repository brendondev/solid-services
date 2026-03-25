import { Test, TestingModule } from '@nestjs/testing';
import { CustomerPortalService } from './customer-portal.service';
import { PrismaService } from '@core/database';
import { NotFoundException } from '@nestjs/common';

describe('CustomerPortalService', () => {
  let service: CustomerPortalService;
  let prismaService: PrismaService;

  const mockCustomerId = 'customer-123';
  const mockToken = 'portal-token-abc';

  const mockPortalToken = {
    id: 'token-1',
    customerId: mockCustomerId,
    token: mockToken,
    expiresAt: null,
    customer: {
      id: mockCustomerId,
      name: 'John Doe',
    },
  };

  const mockPrismaService = {
    customerPortalToken: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    customer: {
      findUnique: jest.fn(),
    },
    quotation: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    serviceOrder: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerPortalService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CustomerPortalService>(CustomerPortalService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateToken', () => {
    it('should validate and return portal token', async () => {
      mockPrismaService.customerPortalToken.findUnique.mockResolvedValue(
        mockPortalToken,
      );

      const result = await service.validateToken(mockToken);

      expect(prismaService.customerPortalToken.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { token: mockToken },
        }),
      );
      expect(result).toEqual(mockPortalToken);
    });

    it('should throw NotFoundException if token invalid', async () => {
      mockPrismaService.customerPortalToken.findUnique.mockResolvedValue(null);

      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCustomerQuotations', () => {
    it('should return customer quotations', async () => {
      const mockQuotations = [
        { id: 'quot-1', number: 'QT-001', status: 'pending' },
      ];

      mockPrismaService.customerPortalToken.findUnique.mockResolvedValue(
        mockPortalToken,
      );
      mockPrismaService.quotation.findMany.mockResolvedValue(mockQuotations);

      const result = await service.getCustomerQuotations(mockToken);

      expect(prismaService.quotation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerId: mockCustomerId,
          }),
        }),
      );
      expect(result).toEqual(mockQuotations);
    });
  });

  describe('approveQuotation', () => {
    it('should approve quotation', async () => {
      const quotationId = 'quot-1';
      const mockQuotation = {
        id: quotationId,
        customerId: mockCustomerId,
        status: 'pending',
      };

      mockPrismaService.customerPortalToken.findUnique.mockResolvedValue(
        mockPortalToken,
      );
      mockPrismaService.quotation.findFirst.mockResolvedValue(mockQuotation);
      mockPrismaService.quotation.update.mockResolvedValue({
        ...mockQuotation,
        status: 'approved',
      });

      const result = await service.approveQuotation(mockToken, quotationId);

      expect(prismaService.quotation.update).toHaveBeenCalledWith({
        where: { id: quotationId },
        data: { status: 'approved' },
        include: expect.any(Object),
      });
      expect(result.status).toBe('approved');
    });
  });

  describe('getCustomerOrders', () => {
    it('should return customer orders', async () => {
      const mockOrders = [{ id: 'order-1', number: 'OS-001' }];

      mockPrismaService.customerPortalToken.findUnique.mockResolvedValue(
        mockPortalToken,
      );
      mockPrismaService.serviceOrder.findMany.mockResolvedValue(mockOrders);

      const result = await service.getCustomerOrders(mockToken);

      expect(result).toEqual(mockOrders);
    });
  });
});
