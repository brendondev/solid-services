import { Test, TestingModule } from '@nestjs/testing';
import { DigitalSignatureService } from './digital-signature.service';
import { LocalSignatureService } from './local-signature.service';
import { GovbrSignatureService } from './govbr-signature.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('DigitalSignatureService', () => {
  let service: DigitalSignatureService;
  let localSignature: LocalSignatureService;
  let govbrSignature: GovbrSignatureService;

  const mockLocalSignatureService = {
    signDocument: jest.fn(),
    verifySignature: jest.fn(),
  };

  const mockGovbrSignatureService = {
    initiateSignature: jest.fn(),
    verifyCallback: jest.fn(),
    getSignatureStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DigitalSignatureService,
        { provide: LocalSignatureService, useValue: mockLocalSignatureService },
        { provide: GovbrSignatureService, useValue: mockGovbrSignatureService },
      ],
    }).compile();

    service = module.get<DigitalSignatureService>(DigitalSignatureService);
    localSignature = module.get<LocalSignatureService>(LocalSignatureService);
    govbrSignature = module.get<GovbrSignatureService>(GovbrSignatureService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signDocument', () => {
    it('should sign document using local method', async () => {
      const mockRequest = {
        documentId: 'doc-1',
        signatureData: 'canvas_base64_data',
        method: 'local',
      };

      const mockSignature = {
        id: 'sig-1',
        documentId: 'doc-1',
        signatureHash: 'hash123',
        method: 'local',
      };

      mockLocalSignatureService.signDocument.mockResolvedValue(mockSignature);

      const result = await service.signDocument(mockRequest as any);

      expect(localSignature.signDocument).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockSignature);
    });

    it('should sign document using govbr method', async () => {
      const mockRequest = {
        documentId: 'doc-1',
        method: 'govbr',
        cpf: '12345678900',
      };

      const mockResponse = {
        authUrl: 'https://govbr.example.com/auth',
        signatureId: 'sig-1',
      };

      mockGovbrSignatureService.initiateSignature.mockResolvedValue(
        mockResponse,
      );

      const result = await service.signDocument(mockRequest as any);

      expect(govbrSignature.initiateSignature).toHaveBeenCalledWith(
        mockRequest,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw BadRequestException for invalid method', async () => {
      const mockRequest = {
        documentId: 'doc-1',
        method: 'invalid',
      };

      await expect(
        service.signDocument(mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifySignature', () => {
    it('should verify signature', async () => {
      const signatureId = 'sig-1';
      const mockVerification = {
        isValid: true,
        signedAt: new Date(),
        signer: 'John Doe',
      };

      mockLocalSignatureService.verifySignature.mockResolvedValue(
        mockVerification,
      );

      const result = await service.verifySignature(signatureId);

      expect(result).toEqual(mockVerification);
    });
  });

  describe('getSignatureStatus', () => {
    it('should get signature status', async () => {
      const signatureId = 'sig-1';
      const mockStatus = {
        id: signatureId,
        status: 'completed',
        method: 'govbr',
      };

      mockGovbrSignatureService.getSignatureStatus.mockResolvedValue(
        mockStatus,
      );

      const result = await service.getSignatureStatus(signatureId);

      expect(result).toEqual(mockStatus);
    });
  });
});
