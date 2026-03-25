import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database';
import { StorageService } from '../../core/storage';
import { tenantStorage } from '../../core/tenant';
import { RealTimeService } from '../notifications/real-time.service';
import { NotificationsDataService } from '../notifications/notifications-data.service';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
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
    private readonly realTimeService: RealTimeService,
    private readonly notificationsData: NotificationsDataService,
  ) {}

  /**
   * Assina um documento (orçamento ou ordem de serviço)
   */
  async signDocument(
    userId: string,
    dto: SignDocumentDto,
  ): Promise<SignatureResult> {
    const { documentType, documentId, signatureType, govbrAccessToken, signatureImage } = dto;

    // Buscar documento SEM contexto de tenant (endpoint público)
    const document = await this.getDocumentWithoutContext(documentType, documentId);

    if (!document) {
      throw new NotFoundException(`${documentType} não encontrado`);
    }

    // Verificar se já está assinado
    if (document.signedAt) {
      throw new BadRequestException('Documento já foi assinado');
    }

    // Extrair tenantId do documento para estabelecer contexto
    const tenantId = document.tenantId;

    // Executar toda a lógica dentro do contexto do tenant usando tenantStorage
    return tenantStorage.run({ tenantId }, async () => {
      console.log('[DigitalSignature] Signing document with context:', {
        tenantId,
        documentType,
        documentId,
        userId,
      });

      // Determinar userId real (buscar admin do tenant se userId for 'portal-user')
      let actualUserId = userId;
      const isPortalSignature = userId === 'portal-user' || !userId;

      if (isPortalSignature) {
        // Buscar primeiro admin do tenant
        const adminUser = await this.prisma.user.findFirst({
          where: {
            tenantId,
            roles: { has: 'admin' },
          },
          select: { id: true },
        });

        if (adminUser) {
          actualUserId = adminUser.id;
          console.log('[DigitalSignature] Portal signature - using admin user for record:', actualUserId);
        } else {
          throw new BadRequestException('Nenhum usuário admin encontrado no tenant');
        }
      }

      // Gerar PDF do documento
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
        signedData = await this.localService.signPDF(pdfBuffer, signatureImage);
      }

      // Salvar documento assinado no storage
      const filename = `${documentType}-${documentId}-signed.pdf`;
      const folder = documentType === 'quotation' ? 'quotations' : 'orders';

      const storageKey = await this.storage.uploadFile(
        signedData,
        tenantId,
        folder,
        filename,
      );

      // Gerar URL pública para o arquivo (absoluta com domínio da API)
      const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
      const signedDocumentUrl = `${apiBaseUrl}/api/v1/storage/download/${encodeURIComponent(storageKey)}`;

      // Calcular hash da assinatura
      const signatureHash = this.calculateSHA256(signedData).toString('hex');

      // Atualizar banco de dados
      await this.updateDocument(documentType, documentId, {
        signedAt: new Date(),
        signedBy: actualUserId,
        signedDocumentUrl,
        signatureHash,
      });

      // Enviar notificações
      await this.notifyDocumentSigned(tenantId, documentType, documentId, document, actualUserId, isPortalSignature);

      console.log('[DigitalSignature] Document signed successfully');

      return {
        signedDocumentUrl,
        signatureHash,
        signedAt: new Date(),
        signedBy: actualUserId,
        signatureType: type,
      };
    });
  }

  /**
   * Busca documento SEM contexto de tenant (para endpoint público)
   */
  private async getDocumentWithoutContext(type: string, id: string) {
    // Usar withoutTenant para buscar documento sem contexto
    // É seguro porque vamos estabelecer o contexto depois com o tenantId do documento
    return this.prisma.withoutTenant(async () => {
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
    }, true); // safe = true, pois é um caso legítimo
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
   */
  private async generatePDF(type: string, document: any): Promise<Buffer> {
    try {
      // Criar novo documento PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size
      const { width, height } = page.getSize();

      // Fontes
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let yPosition = height - 50;

      // Título
      page.drawText(
        type === 'quotation' ? 'ORÇAMENTO' : 'ORDEM DE SERVIÇO',
        {
          x: 50,
          y: yPosition,
          size: 20,
          font: fontBold,
          color: rgb(0, 0, 0),
        },
      );

      yPosition -= 10;
      page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: width - 50, y: yPosition },
        thickness: 2,
        color: rgb(0, 0, 0),
      });

      yPosition -= 30;

      // Número
      page.drawText(`Número: ${document.number}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: fontBold,
      });

      yPosition -= 20;

      // Cliente
      if (document.customer) {
        page.drawText(`Cliente: ${document.customer.name}`, {
          x: 50,
          y: yPosition,
          size: 11,
          font: fontRegular,
        });
        yPosition -= 20;
      }

      // Data
      page.drawText(
        `Data: ${new Date(document.createdAt).toLocaleDateString('pt-BR')}`,
        {
          x: 50,
          y: yPosition,
          size: 11,
          font: fontRegular,
        },
      );

      yPosition -= 30;

      // Itens
      if (document.items && document.items.length > 0) {
        page.drawText('ITENS:', {
          x: 50,
          y: yPosition,
          size: 12,
          font: fontBold,
        });

        yPosition -= 20;

        document.items.forEach((item: any, index: number) => {
          const itemText = `${index + 1}. ${item.description || item.service?.name || 'Item'} - Qtd: ${item.quantity} - R$ ${Number(item.totalPrice).toFixed(2)}`;

          page.drawText(itemText, {
            x: 60,
            y: yPosition,
            size: 10,
            font: fontRegular,
          });

          yPosition -= 18;

          // Se passar de metade da página, avisar que há mais itens
          if (yPosition < 200 && index < document.items.length - 1) {
            page.drawText('...', {
              x: 60,
              y: yPosition,
              size: 10,
              font: fontRegular,
            });
            return;
          }
        });

        yPosition -= 10;
      }

      // Total
      page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: width - 50, y: yPosition },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
      });

      yPosition -= 20;

      page.drawText(
        `TOTAL: R$ ${Number(document.totalAmount).toFixed(2)}`,
        {
          x: 50,
          y: yPosition,
          size: 14,
          font: fontBold,
        },
      );

      // Observações
      if (document.notes) {
        yPosition -= 30;
        page.drawText('Observações:', {
          x: 50,
          y: yPosition,
          size: 11,
          font: fontBold,
        });

        yPosition -= 18;
        const notes = document.notes.substring(0, 200); // Limitar tamanho
        page.drawText(notes, {
          x: 50,
          y: yPosition,
          size: 9,
          font: fontRegular,
          maxWidth: width - 100,
        });
      }

      // Salvar e retornar
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('[DigitalSignature] Error generating PDF:', error);
      throw new BadRequestException('Erro ao gerar PDF do documento');
    }
  }

  /**
   * Envia notificações de documento assinado
   *
   * IMPORTANTE: Para assinaturas do portal (cliente), não enviamos notificações aqui
   * pois elas já são enviadas pelo método approveQuotation no customer-portal.service.ts
   */
  private async notifyDocumentSigned(
    tenantId: string,
    documentType: string,
    documentId: string,
    document: any,
    signedByUserId: string,
    isPortalSignature: boolean = false,
  ): Promise<void> {
    try {
      console.log('[DigitalSignature] Sending notification...', {
        tenantId,
        documentType,
        documentId,
        signedByUserId,
        isPortalSignature,
      });

      // Se é assinatura do portal, não enviar notificações aqui
      // Elas já foram enviadas pelo customer-portal.service.ts quando o orçamento foi aprovado
      if (isPortalSignature) {
        console.log('[DigitalSignature] Portal signature - skipping notifications (already sent by approval flow)');
        return;
      }

      // Buscar usuário que assinou
      const signedByUser = await this.prisma.user.findUnique({
        where: { id: signedByUserId },
        select: { name: true, email: true },
      });

      console.log('[DigitalSignature] Signed by user:', signedByUser);

      // Determinar tipo e número do documento
      const docTypeLabel = documentType === 'quotation' ? 'Orçamento' : 'Ordem de Serviço';
      const docNumber = document.number || documentId.substring(0, 8);

      // Buscar TODOS os usuários ativos do tenant para notificar
      const users = await this.prisma.user.findMany({
        where: {
          tenantId,
          status: 'active',
        },
        select: { id: true, name: true, roles: true },
      });

      console.log('[DigitalSignature] Active users found:', users.length);

      // Para assinatura interna, notificar todos EXCETO quem assinou
      const usersToNotify = users
        .filter((user) => user.id !== signedByUserId)
        .map((user) => user.id);

      console.log('[DigitalSignature] Users to notify:', usersToNotify.length, '(internal signature - exclude signer)');

      if (usersToNotify.length === 0) {
        console.log('[DigitalSignature] No users to notify, skipping...');
        return;
      }

      // Preparar dados da notificação
      const signerName = signedByUser?.name || 'um usuário';

      const notificationData = {
        type: 'DOCUMENT_SIGNED',
        title: `${docTypeLabel} Assinado`,
        message: `${docTypeLabel} #${docNumber} foi assinado digitalmente por ${signerName}`,
        data: {
          documentType,
          documentId,
          documentNumber: docNumber,
          signedBy: signerName,
          signedAt: new Date(),
          isPortalSignature,
        },
      };

      // Criar notificações no banco para cada usuário
      const notificationsToCreate = usersToNotify.map((userId) => ({
        userId,
        ...notificationData,
      }));

      const createdNotifications = await this.notificationsData.createManyAndReturn(notificationsToCreate, tenantId);
      console.log('[DigitalSignature] Notifications created in database:', createdNotifications.length);

      // Enviar notificações em tempo real COM o ID do banco
      createdNotifications.forEach((notification) => {
        this.realTimeService.sendToUser(tenantId, notification.userId, {
          ...notificationData,
          id: notification.id, // ← Incluir o ID do banco!
        } as any); // Type cast porque incluímos o ID
      });

      console.log('[DigitalSignature] Real-time notifications sent successfully');
    } catch (error) {
      // Não falhar a assinatura se a notificação falhar
      console.error('[DigitalSignature] Error sending notification:', error);
    }
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
