import { Injectable } from '@nestjs/common';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as path from 'path';
import * as fs from 'fs';

// Import usando require para pdfmake (CommonJS module)
const PdfPrinter = require('pdfmake');

@Injectable()
export class QuotationPdfService {
  private printer: any;

  constructor() {
    try {
      // Tenta carregar as fontes do Roboto do pdfmake
      const fontPath = path.join(process.cwd(), 'node_modules', 'pdfmake', 'build');

      // Usa fontes padrão disponíveis no sistema ou fallback para Courier
      const fonts = {
        Courier: {
          normal: 'Courier',
          bold: 'Courier-Bold',
          italics: 'Courier-Oblique',
          bolditalics: 'Courier-BoldOblique'
        }
      };

      this.printer = new PdfPrinter(fonts);
      this.initializePrinter = () => {}; // Já inicializado
    } catch (error) {
      console.warn('PdfMake initialization failed, PDF generation will not work:', error);
      this.printer = null;
      this.initializePrinter = () => {};
    }
  }

  private initializePrinter: () => void;

  async generateQuotationPdf(quotation: any): Promise<Buffer> {
    // Inicializar printer se necessário
    this.initializePrinter();

    if (!this.printer) {
      throw new Error('PDF printer not initialized');
    }

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: 'Courier'
      },

      header: {
        margin: [40, 20, 40, 0],
        columns: [
          {
            text: 'ORÇAMENTO',
            style: 'header',
            alignment: 'left',
          },
          {
            text: quotation.number,
            style: 'header',
            alignment: 'right',
          },
        ],
      },

      footer: (currentPage: number, pageCount: number) => ({
        margin: [40, 0, 40, 20],
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: 'center',
        style: 'footer',
      }),

      content: [
        // Informações da empresa (placeholder - seria do tenant)
        {
          text: 'Solid Service',
          style: 'companyName',
          margin: [0, 0, 0, 5],
        },
        {
          text: 'Sistema de Gestão para Prestadores de Serviços',
          style: 'companyInfo',
          margin: [0, 0, 0, 20],
        },

        // Linha divisória
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              lineColor: '#e5e7eb',
            },
          ],
          margin: [0, 0, 0, 20],
        },

        // Informações do cliente
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'CLIENTE', style: 'sectionTitle' },
                { text: quotation.customer.name, style: 'clientInfo' },
                {
                  text: quotation.customer.email || '-',
                  style: 'clientInfoSecondary',
                },
                {
                  text: quotation.customer.phone || '-',
                  style: 'clientInfoSecondary',
                },
              ],
            },
            {
              width: '50%',
              stack: [
                { text: 'INFORMAÇÕES', style: 'sectionTitle' },
                {
                  text: `Data: ${new Date(quotation.createdAt).toLocaleDateString('pt-BR')}`,
                  style: 'infoText',
                },
                {
                  text: `Status: ${this.translateStatus(quotation.status)}`,
                  style: 'infoText',
                },
                {
                  text: `Validade: ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('pt-BR') : 'Não informada'}`,
                  style: 'infoText',
                },
              ],
            },
          ],
          margin: [0, 0, 0, 30],
        },

        // Tabela de itens
        {
          text: 'ITENS DO ORÇAMENTO',
          style: 'sectionTitle',
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 60, 80, 100],
            body: [
              [
                { text: 'Descrição', style: 'tableHeader' },
                { text: 'Qtd', style: 'tableHeader', alignment: 'center' },
                { text: 'Valor Unit.', style: 'tableHeader', alignment: 'right' },
                { text: 'Total', style: 'tableHeader', alignment: 'right' },
              ],
              ...quotation.items.map((item: any) => [
                { text: item.description || item.service?.name || '-', style: 'tableCell' },
                { text: item.quantity.toString(), style: 'tableCell', alignment: 'center' },
                {
                  text: this.formatCurrency(Number(item.unitPrice)),
                  style: 'tableCell',
                  alignment: 'right',
                },
                {
                  text: this.formatCurrency(Number(item.quantity) * Number(item.unitPrice)),
                  style: 'tableCell',
                  alignment: 'right',
                },
              ]),
            ],
          },
          layout: {
            hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
            vLineWidth: () => 0,
            hLineColor: () => '#e5e7eb',
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 8,
            paddingBottom: () => 8,
          },
        },

        // Total
        {
          margin: [0, 20, 0, 0],
          table: {
            widths: ['*', 100],
            body: [
              [
                { text: 'VALOR TOTAL', style: 'totalLabel', alignment: 'right', border: [false, true, false, false] },
                {
                  text: this.formatCurrency(Number(quotation.totalAmount)),
                  style: 'totalValue',
                  alignment: 'right',
                  border: [false, true, false, false],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            hLineColor: () => '#3b82f6',
            paddingTop: () => 10,
            paddingBottom: () => 10,
          },
        },

        // Observações
        ...(quotation.notes
          ? [
              {
                margin: [0, 30, 0, 0] as [number, number, number, number],
                stack: [
                  { text: 'OBSERVAÇÕES', style: 'sectionTitle' },
                  { text: quotation.notes, style: 'notes' },
                ],
              },
            ]
          : []),
      ],

      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#1f2937',
        },
        companyName: {
          fontSize: 20,
          bold: true,
          color: '#1f2937',
        },
        companyInfo: {
          fontSize: 10,
          color: '#6b7280',
        },
        sectionTitle: {
          fontSize: 12,
          bold: true,
          color: '#374151',
          margin: [0, 0, 0, 5],
        },
        clientInfo: {
          fontSize: 12,
          color: '#1f2937',
          margin: [0, 2, 0, 0],
        },
        clientInfoSecondary: {
          fontSize: 10,
          color: '#6b7280',
          margin: [0, 2, 0, 0],
        },
        infoText: {
          fontSize: 10,
          color: '#374151',
          margin: [0, 2, 0, 0],
        },
        tableHeader: {
          fontSize: 10,
          bold: true,
          color: '#374151',
          fillColor: '#f3f4f6',
        },
        tableCell: {
          fontSize: 10,
          color: '#1f2937',
        },
        totalLabel: {
          fontSize: 14,
          bold: true,
          color: '#1f2937',
        },
        totalValue: {
          fontSize: 18,
          bold: true,
          color: '#3b82f6',
        },
        notes: {
          fontSize: 10,
          color: '#374151',
          margin: [0, 5, 0, 0],
        },
        footer: {
          fontSize: 8,
          color: '#9ca3af',
        },
      },
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];

        pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', reject);

        pdfDoc.end();
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
