import { Injectable } from '@nestjs/common';

// Import PDFKit usando require (CommonJS module)
const PDFDocument = require('pdfkit');

@Injectable()
export class OrderPdfService {
  private readonly primaryColor = '#3b82f6';
  private readonly darkGray = '#1f2937';
  private readonly lightGray = '#6b7280';
  private readonly bgGray = '#f9fafb';
  private readonly borderGray = '#e5e7eb';

  async generateOrderPdf(order: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 0,
          bufferPages: true,
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // HEADER COM GRADIENTE
        this.addHeader(doc, order);

        // CONTEÚDO PRINCIPAL
        doc.y = 120;
        this.addClientInfo(doc, order);
        this.addOrderInfo(doc, order);
        this.addItemsTable(doc, order);
        this.addChecklist(doc, order);
        this.addTimeline(doc, order);
        this.addNotes(doc, order);

        // FOOTER em todas as páginas
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          this.addFooter(doc, i + 1, pages.count);
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader(doc: any, order: any) {
    // Background azul no topo
    doc
      .rect(0, 0, 595, 100)
      .fill(this.primaryColor);

    // Nome da empresa (branco)
    doc
      .fillColor('#ffffff')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('SOLID SERVICE', 50, 30, { align: 'left' });

    // Subtítulo
    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Sistema de Gestão para Prestadores de Serviços', 50, 60);

    // Número da ordem (direita)
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('ORDEM DE SERVIÇO', 380, 30, { align: 'right', width: 165 })
      .fontSize(18)
      .text(order.number, 380, 50, { align: 'right', width: 165 });

    // Status badge
    const statusInfo = this.getStatusBadge(order.status);
    doc
      .rect(420, 75, 125, 18)
      .fill(statusInfo.bg);

    doc
      .fillColor(statusInfo.color)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(statusInfo.label, 420, 79, { align: 'center', width: 125 });
  }

  private addClientInfo(doc: any, order: any) {
    const startY = doc.y + 10;

    // Box do cliente
    doc
      .rect(50, startY, 245, 90)
      .strokeColor(this.borderGray)
      .lineWidth(1)
      .stroke();

    // Título
    doc
      .fillColor(this.darkGray)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('CLIENTE', 60, startY + 12);

    // Informações do cliente
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor(this.darkGray)
      .text(order.customer.name, 60, startY + 32, { width: 225 });

    const contact = order.customer.contacts?.[0];
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.lightGray)
      .text(contact?.email || 'Email não informado', 60, startY + 50, { width: 225 })
      .text(contact?.phone || 'Telefone não informado', 60, startY + 65, { width: 225 });

    doc.y = startY + 95;
  }

  private addOrderInfo(doc: any, order: any) {
    const startY = 130;

    // Box de informações
    doc
      .rect(305, startY, 240, 90)
      .strokeColor(this.borderGray)
      .lineWidth(1)
      .stroke();

    // Título
    doc
      .fillColor(this.darkGray)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('INFORMAÇÕES', 315, startY + 12);

    // Data de criação
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.lightGray)
      .text('Data de Criação:', 315, startY + 35);

    doc
      .font('Helvetica-Bold')
      .fillColor(this.darkGray)
      .text(
        new Date(order.createdAt).toLocaleDateString('pt-BR'),
        425,
        startY + 35,
        { width: 110, align: 'right' }
      );

    // Data agendada
    if (order.scheduledFor) {
      doc
        .font('Helvetica')
        .fillColor(this.lightGray)
        .text('Agendado para:', 315, startY + 53);

      doc
        .font('Helvetica-Bold')
        .fillColor(this.darkGray)
        .text(
          new Date(order.scheduledFor).toLocaleDateString('pt-BR') +
          ' ' +
          new Date(order.scheduledFor).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          385,
          startY + 53,
          { width: 150, align: 'right' }
        );
    }

    // Data de conclusão
    if (order.completedAt) {
      doc
        .font('Helvetica')
        .fillColor(this.lightGray)
        .text('Concluído em:', 315, startY + 71);

      doc
        .font('Helvetica-Bold')
        .fillColor(this.darkGray)
        .text(
          new Date(order.completedAt).toLocaleDateString('pt-BR'),
          425,
          startY + 71,
          { width: 110, align: 'right' }
        );
    }
  }

  private addItemsTable(doc: any, order: any) {
    if (!order.items || order.items.length === 0) return;

    const tableTop = 245;
    doc.y = tableTop;

    // Título da seção
    doc
      .fillColor(this.darkGray)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('SERVIÇOS EXECUTADOS', 50, tableTop);

    const headerY = tableTop + 25;

    // Header da tabela
    doc
      .rect(50, headerY, 495, 25)
      .fill(this.bgGray);

    doc
      .fillColor(this.darkGray)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('DESCRIÇÃO', 60, headerY + 8, { width: 380 })
      .text('QTD', 450, headerY + 8, { width: 75, align: 'center' });

    let currentY = headerY + 25;

    // Linhas dos itens
    order.items.forEach((item: any, index: number) => {
      // Verificar se precisa de nova página
      if (currentY > 700) {
        doc.addPage({ margin: 0 });
        currentY = 80;
      }

      const description = item.description || `Serviço #${index + 1}`;
      const rowHeight = Math.max(25, Math.ceil(description.length / 60) * 12);
      const bgColor = index % 2 === 0 ? '#ffffff' : this.bgGray;

      // Background da linha
      doc
        .rect(50, currentY, 495, rowHeight)
        .fill(bgColor);

      // Border inferior
      doc
        .moveTo(50, currentY + rowHeight)
        .lineTo(545, currentY + rowHeight)
        .strokeColor(this.borderGray)
        .lineWidth(0.5)
        .stroke();

      // Conteúdo
      doc
        .fillColor(this.darkGray)
        .fontSize(9)
        .font('Helvetica')
        .text(description, 60, currentY + 8, {
          width: 375,
          height: rowHeight - 16,
        })
        .text(Number(item.quantity).toString(), 450, currentY + 8, {
          width: 75,
          align: 'center',
        });

      currentY += rowHeight;
    });

    doc.y = currentY + 10;
  }

  private addChecklist(doc: any, order: any) {
    if (!order.checklists || order.checklists.length === 0) return;

    // Verificar se precisa de nova página
    if (doc.y > 650) {
      doc.addPage({ margin: 0 });
      doc.y = 80;
    }

    // Título da seção
    doc
      .fillColor(this.darkGray)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('CHECKLIST DE EXECUÇÃO', 50, doc.y);

    doc.y += 25;

    // Itens do checklist
    order.checklists
      .sort((a: any, b: any) => a.order - b.order)
      .forEach((item: any) => {
        if (doc.y > 750) {
          doc.addPage({ margin: 0 });
          doc.y = 80;
        }

        const checkSymbol = item.isCompleted ? '✓' : '□';
        const textColor = item.isCompleted ? this.lightGray : this.darkGray;

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor(item.isCompleted ? '#10b981' : this.darkGray)
          .text(checkSymbol, 60, doc.y, { continued: true, width: 20 })
          .font('Helvetica')
          .fillColor(textColor)
          .text(`  ${item.title}`, { width: 470 });

        doc.y += 20;
      });

    doc.y += 10;
  }

  private addTimeline(doc: any, order: any) {
    if (!order.timeline || order.timeline.length === 0) return;

    // Verificar se precisa de nova página
    if (doc.y > 600) {
      doc.addPage({ margin: 0 });
      doc.y = 80;
    }

    // Título da seção
    doc
      .fillColor(this.darkGray)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('HISTÓRICO DE EVENTOS', 50, doc.y);

    doc.y += 25;

    // Eventos da timeline
    order.timeline
      .slice(0, 10) // Últimos 10 eventos
      .forEach((event: any) => {
        if (doc.y > 720) {
          doc.addPage({ margin: 0 });
          doc.y = 80;
        }

        // Bullet point
        doc
          .circle(63, doc.y + 5, 3)
          .fillAndStroke(this.primaryColor, this.primaryColor);

        // Evento
        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .fillColor(this.darkGray)
          .text(event.event, 75, doc.y, { width: 200 });

        // Data
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor(this.lightGray)
          .text(
            new Date(event.createdAt).toLocaleString('pt-BR'),
            285,
            doc.y,
            { width: 250, align: 'right' }
          );

        doc.y += 15;

        // Descrição (se houver)
        if (event.description) {
          doc
            .fontSize(8)
            .font('Helvetica')
            .fillColor(this.lightGray)
            .text(event.description, 75, doc.y, { width: 460 });

          doc.y += 12;
        }

        doc.y += 5;
      });

    doc.y += 10;
  }

  private addNotes(doc: any, order: any) {
    if (!order.observations) return;

    // Verificar se precisa de nova página
    if (doc.y > 650) {
      doc.addPage({ margin: 0 });
      doc.y = 80;
    }

    // Box de observações
    const boxHeight = Math.min(100, 50 + order.observations.split('\n').length * 12);

    doc
      .rect(50, doc.y, 495, boxHeight)
      .strokeColor(this.borderGray)
      .lineWidth(1)
      .stroke();

    doc
      .fillColor(this.darkGray)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('OBSERVAÇÕES', 60, doc.y + 12);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.lightGray)
      .text(order.observations, 60, doc.y + 30, {
        width: 475,
        height: boxHeight - 40,
      });
  }

  private addFooter(doc: any, pageNumber: number, totalPages: number) {
    const footerY = 800;

    // Linha separadora
    doc
      .moveTo(50, footerY - 10)
      .lineTo(545, footerY - 10)
      .strokeColor(this.borderGray)
      .lineWidth(1)
      .stroke();

    // Texto do footer
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(this.lightGray)
      .text(
        `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        50,
        footerY,
        { width: 300, align: 'left' }
      )
      .text(`Página ${pageNumber} de ${totalPages}`, 245, footerY, {
        width: 300,
        align: 'right',
      });
  }

  private getStatusBadge(status: string): { label: string; color: string; bg: string } {
    const badges: Record<string, { label: string; color: string; bg: string }> = {
      pending: { label: 'PENDENTE', color: '#f59e0b', bg: '#fef3c7' },
      scheduled: { label: 'AGENDADO', color: '#3b82f6', bg: '#dbeafe' },
      in_progress: { label: 'EM ANDAMENTO', color: '#f97316', bg: '#ffedd5' },
      completed: { label: 'CONCLUÍDO', color: '#10b981', bg: '#d1fae5' },
      cancelled: { label: 'CANCELADO', color: '#ef4444', bg: '#fee2e2' },
    };

    return badges[status] || badges.pending;
  }
}
