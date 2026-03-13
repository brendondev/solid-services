import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

/**
 * Notifications Service
 *
 * Gerencia envio de emails usando Resend
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend;
  private fromEmail: string;
  private isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
    this.isEnabled = !!apiKey;

    if (this.isEnabled) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend initialized successfully');
    } else {
      this.logger.warn('Resend API key not configured - emails will be logged only');
    }
  }

  /**
   * Envia email de orçamento criado para o cliente
   */
  async sendQuotationCreated(data: {
    to: string;
    customerName: string;
    quotationNumber: string;
    totalAmount: number;
    portalUrl: string;
  }) {
    const subject = `Novo Orçamento: ${data.quotationNumber}`;
    const html = this.getQuotationCreatedTemplate(data);

    return this.sendEmail({
      to: data.to,
      subject,
      html,
    });
  }

  /**
   * Envia notificação de aprovação de orçamento para o admin
   */
  async sendQuotationApproved(data: {
    to: string;
    customerName: string;
    quotationNumber: string;
    totalAmount: number;
  }) {
    const subject = `✅ Orçamento Aprovado: ${data.quotationNumber}`;
    const html = this.getQuotationApprovedTemplate(data);

    return this.sendEmail({
      to: data.to,
      subject,
      html,
    });
  }

  /**
   * Envia notificação de rejeição de orçamento para o admin
   */
  async sendQuotationRejected(data: {
    to: string;
    customerName: string;
    quotationNumber: string;
  }) {
    const subject = `❌ Orçamento Rejeitado: ${data.quotationNumber}`;
    const html = this.getQuotationRejectedTemplate(data);

    return this.sendEmail({
      to: data.to,
      subject,
      html,
    });
  }

  /**
   * Envia confirmação de agendamento ao cliente
   */
  async sendOrderScheduled(data: {
    to: string;
    customerName: string;
    orderNumber: string;
    scheduledDate: string;
    scheduledTime: string;
  }) {
    const subject = `Serviço Agendado: ${data.orderNumber}`;
    const html = this.getOrderScheduledTemplate(data);

    return this.sendEmail({
      to: data.to,
      subject,
      html,
    });
  }

  /**
   * Envia notificação de conclusão do serviço
   */
  async sendOrderCompleted(data: {
    to: string;
    customerName: string;
    orderNumber: string;
    completedAt: string;
  }) {
    const subject = `Serviço Concluído: ${data.orderNumber}`;
    const html = this.getOrderCompletedTemplate(data);

    return this.sendEmail({
      to: data.to,
      subject,
      html,
    });
  }

  /**
   * Envia confirmação de pagamento recebido
   */
  async sendPaymentReceived(data: {
    to: string;
    customerName: string;
    amount: number;
    method: string;
    receiptNumber: string;
  }) {
    const subject = `Pagamento Recebido - ${data.receiptNumber}`;
    const html = this.getPaymentReceivedTemplate(data);

    return this.sendEmail({
      to: data.to,
      subject,
      html,
    });
  }

  /**
   * Envia link de acesso ao portal do cliente
   */
  async sendPortalAccess(data: {
    to: string;
    customerName: string;
    portalUrl: string;
    expiresIn: string;
  }) {
    const subject = 'Acesso ao Portal do Cliente';
    const html = this.getPortalAccessTemplate(data);

    return this.sendEmail({
      to: data.to,
      subject,
      html,
    });
  }

  /**
   * Método interno para enviar email via Resend
   */
  private async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }) {
    if (!this.isEnabled) {
      this.logger.log(`[EMAIL MOCK] To: ${params.to} | Subject: ${params.subject}`);
      return { success: true, id: 'mock-email-id' };
    }

    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      this.logger.log(`Email sent successfully: ${result.data?.id}`);
      return { success: true, id: result.data?.id };
    } catch (error: any) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Templates HTML para os emails
   * TODO: Migrar para React Email em produção
   */
  private getQuotationCreatedTemplate(data: {
    customerName: string;
    quotationNumber: string;
    totalAmount: number;
    portalUrl: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Novo Orçamento Disponível</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.customerName}</strong>,</p>
              <p>Seu orçamento <strong>${data.quotationNumber}</strong> está pronto!</p>
              <p><strong>Valor Total:</strong> R$ ${data.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p>Acesse o portal do cliente para revisar os detalhes e aprovar ou rejeitar o orçamento:</p>
              <a href="${data.portalUrl}" class="button">Acessar Portal</a>
              <p>Este link é válido por 7 dias.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Solid Service - Sistema de Gestão</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getQuotationApprovedTemplate(data: {
    customerName: string;
    quotationNumber: string;
    totalAmount: number;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Orçamento Aprovado!</h1>
            </div>
            <div class="content">
              <p>O cliente <strong>${data.customerName}</strong> aprovou o orçamento <strong>${data.quotationNumber}</strong>!</p>
              <p><strong>Valor:</strong> R$ ${data.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p>Próximos passos: Criar a ordem de serviço e agendar a execução.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Solid Service - Sistema de Gestão</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getQuotationRejectedTemplate(data: {
    customerName: string;
    quotationNumber: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Orçamento Rejeitado</h1>
            </div>
            <div class="content">
              <p>O cliente <strong>${data.customerName}</strong> rejeitou o orçamento <strong>${data.quotationNumber}</strong>.</p>
              <p>Entre em contato com o cliente para entender os motivos e fazer ajustes.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Solid Service - Sistema de Gestão</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getOrderScheduledTemplate(data: {
    customerName: string;
    orderNumber: string;
    scheduledDate: string;
    scheduledTime: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Serviço Agendado</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.customerName}</strong>,</p>
              <p>Seu serviço <strong>${data.orderNumber}</strong> foi agendado!</p>
              <p><strong>Data:</strong> ${data.scheduledDate}</p>
              <p><strong>Horário:</strong> ${data.scheduledTime}</p>
              <p>Estaremos no local no horário agendado. Em caso de imprevistos, entraremos em contato.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Solid Service - Sistema de Gestão</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getOrderCompletedTemplate(data: {
    customerName: string;
    orderNumber: string;
    completedAt: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Serviço Concluído</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.customerName}</strong>,</p>
              <p>Seu serviço <strong>${data.orderNumber}</strong> foi concluído com sucesso!</p>
              <p><strong>Concluído em:</strong> ${data.completedAt}</p>
              <p>Obrigado por confiar em nossos serviços. Ficamos à disposição para futuros trabalhos!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Solid Service - Sistema de Gestão</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPaymentReceivedTemplate(data: {
    customerName: string;
    amount: number;
    method: string;
    receiptNumber: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Pagamento Recebido</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.customerName}</strong>,</p>
              <p>Confirmamos o recebimento do seu pagamento!</p>
              <p><strong>Valor:</strong> R$ ${data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p><strong>Método:</strong> ${data.method}</p>
              <p><strong>Recibo:</strong> ${data.receiptNumber}</p>
              <p>Obrigado pela sua confiança!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Solid Service - Sistema de Gestão</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPortalAccessTemplate(data: {
    customerName: string;
    portalUrl: string;
    expiresIn: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Acesso ao Portal do Cliente</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.customerName}</strong>,</p>
              <p>Criamos um acesso exclusivo para você acompanhar seus orçamentos e ordens de serviço.</p>
              <p>No portal você pode:</p>
              <ul>
                <li>Visualizar orçamentos pendentes</li>
                <li>Aprovar ou rejeitar orçamentos</li>
                <li>Acompanhar ordens em andamento</li>
                <li>Visualizar histórico de serviços</li>
              </ul>
              <a href="${data.portalUrl}" class="button">Acessar Portal</a>
              <p><strong>Validade:</strong> ${data.expiresIn}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Solid Service - Sistema de Gestão</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
