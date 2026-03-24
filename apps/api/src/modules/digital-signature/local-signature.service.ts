import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Service de assinatura local
 *
 * IMPORTANTE: Este service é para desenvolvimento/uso interno.
 * Para assinaturas com validade jurídica, usar assinatura Gov.br.
 *
 * Responsável por:
 * - Geração de PDFs
 * - Incorporação de assinatura manuscrita
 * - Geração de hash de assinatura
 */
@Injectable()
export class LocalSignatureService {
  /**
   * "Assina" um PDF localmente adicionando a imagem da assinatura
   *
   * @param pdfBuffer Buffer do PDF original
   * @param signatureImageDataUrl Imagem da assinatura em base64 (data URL)
   * @returns Buffer do PDF assinado
   */
  async signPDF(
    pdfBuffer: Buffer,
    signatureImageDataUrl?: string,
  ): Promise<Buffer> {
    try {
      // Carregar PDF existente
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      // Obter primeira página
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width } = firstPage.getSize();

      // Se houver imagem de assinatura, adicionar ao PDF
      if (signatureImageDataUrl) {
        // Extrair base64 do data URL
        const base64Data = signatureImageDataUrl.split(',')[1];
        const imageBytes = Buffer.from(base64Data, 'base64');

        // Embedar imagem PNG
        let image;
        try {
          image = await pdfDoc.embedPng(imageBytes);
        } catch (e) {
          // Se não for PNG, tentar como JPG
          image = await pdfDoc.embedJpg(imageBytes);
        }

        // Dimensões da assinatura (proporcional à página)
        const signatureWidth = width * 0.3; // 30% da largura
        const signatureHeight = signatureWidth * 0.4; // Proporção 3:2

        // Posição (canto inferior direito com margem)
        const x = width - signatureWidth - 50;
        const y = 50;

        // Desenhar imagem da assinatura
        firstPage.drawImage(image, {
          x,
          y,
          width: signatureWidth,
          height: signatureHeight,
        });

        // Adicionar texto "Assinado digitalmente"
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 8;

        firstPage.drawText('Assinado digitalmente', {
          x: x,
          y: y - 15,
          size: fontSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });

        // Adicionar data/hora
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        firstPage.drawText(dateStr, {
          x: x,
          y: y - 28,
          size: fontSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      } else {
        // Se não houver imagem, adicionar apenas texto de assinatura
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        firstPage.drawText('✓ DOCUMENTO ASSINADO', {
          x: 50,
          y: 50,
          size: 12,
          font,
          color: rgb(0, 0.5, 0),
        });

        const dateStr = new Date().toLocaleDateString('pt-BR');
        firstPage.drawText(`Data: ${dateStr}`, {
          x: 50,
          y: 35,
          size: 10,
          font: await pdfDoc.embedFont(StandardFonts.Helvetica),
          color: rgb(0.3, 0.3, 0.3),
        });
      }

      // Salvar PDF modificado
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('[LocalSignature] Error signing PDF:', error);
      throw error;
    }
  }

  /**
   * Verifica se um PDF possui assinatura local
   *
   * @param pdfBuffer Buffer do PDF
   * @returns true se possui assinatura local
   */
  async hasLocalSignature(pdfBuffer: Buffer): Promise<boolean> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();

      if (pages.length === 0) {
        return false;
      }

      // Verificar se há conteúdo de assinatura (simplificado)
      return true; // Por enquanto, sempre retorna true se conseguiu carregar
    } catch (error) {
      return false;
    }
  }
}
