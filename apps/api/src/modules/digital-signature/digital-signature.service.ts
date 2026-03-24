import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database';
import { StorageService } from '../../core/storage';
import { SignDocumentDto } from './dto';
import {
  SignatureResult,
  SignatureType,
} from './interfaces/signature.interface';
import { GovBrSignatureService } from './govbr-signature.service';
import { LocalSignatureService } from './local-signature.service';
import * as crypto from 'crypto';

/**
 * Service principal de assinatura digital
 *
 * Responsável por:
 * - Gerenciar fluxo de assinatura
 * - Calcular hash dos documentos
 * - Delegar para service específico (Gov.br ou Local)
 * - Atualizar banco de dados
 * - Armazenar documentos assinados
 */
@Injectable()
export class DigitalSignatureService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly govbrService: GovBrSignatureService,
    private readonly localService: LocalSignatureService,
  ) {}

  /**
   * Assina um documento (orçamento ou ordem de serviço)
   */
  async signDocument(
    userId: string,
    dto: SignDocumentDto,
  ): Promise<SignatureResult> {
    const { documentType, documentId, signatureType, govbrAccessToken } = dto;

    // Buscar documento
    const document = await this.getDocument(documentType, documentId);

    if (!document) {
      throw new NotFoundException(`${documentType} não encontrado`);
    }

    // Verificar se já está assinado
    if (document.signedAt) {
      throw new BadRequestException('Documento já foi assinado');
    }

    // Gerar PDF do documento (implementar depois)
    // Por enquanto, vamos simular com um PDF fake
    const pdfBuffer = await this.generatePDF(documentType, document);

    // Calcular hash SHA-256
    const hash = this.calculateSHA256(pdfBuffer);
    const hashBase64 = hash.toString('base64');

    // Escolher método de assinatura
    const type = signatureType || SignatureType.LOCAL;
    let signedData: Buffer;

    if (type === SignatureType.GOVBR) {
      if (!govbrAccessToken) {
        throw new BadRequestException(
          'govbrAccessToken é obrigatório para assinatura Gov.br',
        );
      }
      signedData = await this.govbrService.signHash(hashBase64, govbrAccessToken);
    } else {
      signedData = await this.localService.signPDF(pdfBuffer);
    }

    // Salvar documento assinado no storage
    const filename = `${documentType}-${documentId}-signed.pdf`;
    const signedDocumentUrl = await this.storage.uploadFile(
      signedData,
      filename,
      'application/pdf',
      filename,
    );

    // Calcular hash da assinatura
    const signatureHash = this.calculateSHA256(signedData).toString('hex');

    // Atualizar banco de dados
    await this.updateDocument(documentType, documentId, {
      signedAt: new Date(),
      signedBy: userId,
      signedDocumentUrl,
      signatureHash,
    });

    return {
      signedDocumentUrl,
      signatureHash,
      signedAt: new Date(),
      signedBy: userId,
      signatureType: type,
    };
  }

  /**
   * Busca documento no banco de dados
   */
  private async getDocument(type: string, id: string) {
    if (type === 'quotation') {
      return this.prisma.quotation.findUnique({
        where: { id },
        include: {
          items: {
            include: { service: true },
            orderBy: { order: 'asc' },
          },
          customer: {
            include: {
              contacts: { where: { isPrimary: true } },
              addresses: { where: { isPrimary: true } },
            },
          },
        },
      });
    } else {
      return this.prisma.serviceOrder.findUnique({
        where: { id },
        include: {
          items: {
            include: { service: true },
            orderBy: { order: 'asc' },
          },
          customer: {
            include: {
              contacts: { where: { isPrimary: true } },
              addresses: { where: { isPrimary: true } },
            },
          },
        },
      });
    }
  }

  /**
   * Atualiza documento com dados da assinatura
   */
  private async updateDocument(
    type: string,
    id: string,
    data: {
      signedAt: Date;
      signedBy: string;
      signedDocumentUrl: string;
      signatureHash: string;
    },
  ) {
    if (type === 'quotation') {
      return this.prisma.quotation.update({
        where: { id },
        data,
      });
    } else {
      return this.prisma.serviceOrder.update({
        where: { id },
        data,
      });
    }
  }

  /**
   * Calcula hash SHA-256 de um buffer
   */
  private calculateSHA256(buffer: Buffer): Buffer {
    return crypto.createHash('sha256').update(buffer).digest();
  }

  /**
   * Gera PDF do documento
   * TODO: Implementar geração de PDF real
   */
  private async generatePDF(type: string, document: any): Promise<Buffer> {
    // Por enquanto, retorna um PDF fake para testes
    // Na implementação real, usar biblioteca como pdfmake ou puppeteer
    const content = `
      PDF FAKE - ${type.toUpperCase()}
      ID: ${document.id}
      Number: ${document.number}
      Total: ${document.totalAmount}

      Este é um PDF temporário para testes.
      Implementar geração real de PDF depois.
    `;

    return Buffer.from(content, 'utf-8');
  }

  /**
   * Gera URL de autorização OAuth do Gov.br
   */
  getGovBrAuthUrl(scope?: 'sign' | 'signature_session'): string {
    return this.govbrService.getAuthUrl(scope);
  }

  /**
   * Troca código de autorização por access token
   */
  async exchangeGovBrCode(code: string): Promise<string> {
    return this.govbrService.exchangeCodeForToken(code);
  }
}
