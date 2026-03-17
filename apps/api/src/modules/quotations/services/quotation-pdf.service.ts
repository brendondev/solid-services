import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class QuotationPdfService {
  async generateQuotationPdf(quotation: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc
          .fontSize(20)
          .text('ORÇAMENTO', { align: 'center' })
          .fontSize(14)
          .text(quotation.number, { align: 'center' })
          .moveDown();

        // Line separator
        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke()
          .moveDown();

        // Company info
        doc
          .fontSize(16)
          .text('Solid Service', { align: 'left' })
          .fontSize(10)
          .text('Sistema de Gestão para Prestadores de Serviços')
          .moveDown();

        // Client and quotation info
        const startY = doc.y;

        // Left column - Client
        doc
          .fontSize(12)
          .text('CLIENTE', 50, startY)
          .fontSize(10)
          .text(quotation.customer.name, 50, startY + 20)
          .text(quotation.customer.email || '-', 50, startY + 35)
          .text(quotation.customer.phone || '-', 50, startY + 50);

        // Right column - Info
        doc
          .fontSize(12)
          .text('INFORMAÇÕES', 300, startY)
          .fontSize(10)
          .text(`Data: ${new Date(quotation.createdAt).toLocaleDateString('pt-BR')}`, 300, startY + 20)
          .text(`Status: ${this.translateStatus(quotation.status)}`, 300, startY + 35)
          .text(`Validade: ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('pt-BR') : 'Não informada'}`, 300, startY + 50);

        doc.y = startY + 80;
        doc.moveDown();

        // Items section
        doc
          .fontSize(12)
          .text('ITENS DO ORÇAMENTO')
          .moveDown(0.5);

        // Table header
        const tableTop = doc.y;
        const col1X = 50;
        const col2X = 320;
        const col3X = 400;
        const col4X = 480;

        doc
          .fontSize(10)
          .fillColor('#000000')
          .rect(col1X, tableTop, 500, 20)
          .fillAndStroke('#f3f4f6', '#e5e7eb');

        doc
          .fillColor('#000000')
          .text('Descrição', col1X + 5, tableTop + 5, { width: 260 })
          .text('Qtd', col2X + 5, tableTop + 5, { width: 70, align: 'center' })
          .text('Valor Unit.', col3X + 5, tableTop + 5, { width: 70, align: 'right' })
          .text('Total', col4X + 5, tableTop + 5, { width: 65, align: 'right' });

        let currentY = tableTop + 25;

        // Table rows
        quotation.items.forEach((item: any, index: number) => {
          const rowHeight = 25;
          const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';

          doc
            .rect(col1X, currentY, 500, rowHeight)
            .fill(bgColor);

          doc
            .fillColor('#000000')
            .fontSize(9)
            .text(item.description || item.service?.name || '-', col1X + 5, currentY + 5, { width: 260 })
            .text(item.quantity.toString(), col2X + 5, currentY + 5, { width: 70, align: 'center' })
            .text(this.formatCurrency(Number(item.unitPrice)), col3X + 5, currentY + 5, { width: 70, align: 'right' })
            .text(this.formatCurrency(Number(item.quantity) * Number(item.unitPrice)), col4X + 5, currentY + 5, { width: 65, align: 'right' });

          currentY += rowHeight;
        });

        // Total
        doc
          .moveDown()
          .fontSize(14)
          .text('VALOR TOTAL:', col3X - 50, currentY + 20, { width: 120, align: 'right' })
          .fillColor('#3b82f6')
          .fontSize(16)
          .text(this.formatCurrency(Number(quotation.totalAmount)), col4X - 30, currentY + 20, { width: 95, align: 'right' });

        // Notes
        if (quotation.notes) {
          doc
            .fillColor('#000000')
            .moveDown(2)
            .fontSize(12)
            .text('OBSERVAÇÕES')
            .fontSize(10)
            .text(quotation.notes, { width: 500 });
        }

        // Footer
        doc
          .fontSize(8)
          .fillColor('#9ca3af')
          .text(
            `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
            50,
            doc.page.height - 50,
            { align: 'center', width: 500 }
          );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  private translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      draft: 'Rascunho',
      sent: 'Enviado',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
    };
    return statusMap[status] || status;
  }
}
