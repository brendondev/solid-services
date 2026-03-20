import { Controller, Get, Patch, Post, Param, Headers, UnauthorizedException, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { CustomerPortalService } from './customer-portal.service';
import { Public } from '@core/auth/decorators';

/**
 * Customer Portal Controller
 *
 * Endpoints públicos para o portal do cliente
 * Autenticação via header X-Customer-Token
 */
@ApiTags('Customer Portal')
@Controller('portal')
export class CustomerPortalController {
  constructor(
    private readonly customerPortalService: CustomerPortalService,
  ) {}

  /**
   * Gera token de acesso para um cliente (endpoint protegido para admins)
   */
  @Post('generate-token/:customerId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gerar token de acesso ao portal para um cliente' })
  @ApiResponse({ status: 201, description: 'Token gerado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async generateToken(@Param('customerId') customerId: string) {
    const token = await this.customerPortalService.generateAccessToken(customerId);

    // Determinar URL do frontend
    // 1. Usar FRONTEND_URL se estiver definida
    // 2. Senão, usar NEXT_PUBLIC_BASE_URL
    // 3. Fallback para localhost apenas em dev
    const frontendUrl = process.env.FRONTEND_URL
      || process.env.NEXT_PUBLIC_BASE_URL
      || (process.env.NODE_ENV === 'production'
        ? 'https://solid-services-web.vercel.app'
        : 'http://localhost:3001');

    return {
      token,
      portalUrl: `${frontendUrl}/portal/${token}`,
      expiresIn: '7 days',
    };
  }

  /**
   * Valida token e retorna dados do cliente
   */
  @Public()
  @Get('auth/validate')
  @ApiOperation({ summary: 'Validar token de acesso do cliente' })
  @ApiHeader({ name: 'X-Customer-Token', required: true })
  @ApiResponse({ status: 200, description: 'Token válido' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async validateToken(@Headers('x-customer-token') token: string) {
    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }
    return this.customerPortalService.validateToken(token);
  }

  /**
   * Lista orçamentos do cliente
   */
  @Public()
  @Get('quotations')
  @ApiOperation({ summary: 'Listar orçamentos do cliente' })
  @ApiHeader({ name: 'X-Customer-Token', required: true })
  @ApiResponse({ status: 200, description: 'Lista de orçamentos' })
  async getQuotations(@Headers('x-customer-token') token: string) {
    const customer = await this.validateCustomer(token);
    return this.customerPortalService.getCustomerQuotations(customer.id, customer.tenantId);
  }

  /**
   * Busca orçamento específico
   */
  @Public()
  @Get('quotations/:id')
  @ApiOperation({ summary: 'Buscar orçamento específico' })
  @ApiHeader({ name: 'X-Customer-Token', required: true })
  @ApiResponse({ status: 200, description: 'Orçamento encontrado' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  async getQuotation(
    @Param('id') id: string,
    @Headers('x-customer-token') token: string,
  ) {
    const customer = await this.validateCustomer(token);
    return this.customerPortalService.getQuotation(id, customer.id, customer.tenantId);
  }

  /**
   * Aprovar orçamento
   */
  @Public()
  @Patch('quotations/:id/approve')
  @ApiOperation({ summary: 'Aprovar orçamento' })
  @ApiHeader({ name: 'X-Customer-Token', required: true })
  @ApiResponse({ status: 200, description: 'Orçamento aprovado' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  async approveQuotation(
    @Param('id') id: string,
    @Headers('x-customer-token') token: string,
  ) {
    const customer = await this.validateCustomer(token);
    return this.customerPortalService.approveQuotation(id, customer.id, customer.tenantId);
  }

  /**
   * Rejeitar orçamento
   */
  @Public()
  @Patch('quotations/:id/reject')
  @ApiOperation({ summary: 'Rejeitar orçamento' })
  @ApiHeader({ name: 'X-Customer-Token', required: true })
  @ApiResponse({ status: 200, description: 'Orçamento rejeitado' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  async rejectQuotation(
    @Param('id') id: string,
    @Headers('x-customer-token') token: string,
  ) {
    const customer = await this.validateCustomer(token);
    return this.customerPortalService.rejectQuotation(id, customer.id, customer.tenantId);
  }

  /**
   * Lista ordens do cliente
   */
  @Public()
  @Get('orders')
  @ApiOperation({ summary: 'Listar ordens de serviço do cliente' })
  @ApiHeader({ name: 'X-Customer-Token', required: true })
  @ApiResponse({ status: 200, description: 'Lista de ordens' })
  async getOrders(@Headers('x-customer-token') token: string) {
    const customer = await this.validateCustomer(token);
    return this.customerPortalService.getCustomerOrders(customer.id, customer.tenantId);
  }

  /**
   * Busca ordem específica
   */
  @Public()
  @Get('orders/:id')
  @ApiOperation({ summary: 'Buscar ordem específica' })
  @ApiHeader({ name: 'X-Customer-Token', required: true })
  @ApiResponse({ status: 200, description: 'Ordem encontrada' })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada' })
  async getOrder(
    @Param('id') id: string,
    @Headers('x-customer-token') token: string,
  ) {
    const customer = await this.validateCustomer(token);
    return this.customerPortalService.getOrder(id, customer.id, customer.tenantId);
  }

  /**
   * Histórico de serviços
   */
  @Public()
  @Get('history')
  @ApiOperation({ summary: 'Histórico de serviços do cliente' })
  @ApiHeader({ name: 'X-Customer-Token', required: true })
  @ApiResponse({ status: 200, description: 'Histórico de serviços' })
  async getHistory(@Headers('x-customer-token') token: string) {
    const customer = await this.validateCustomer(token);
    return this.customerPortalService.getServiceHistory(customer.id, customer.tenantId);
  }

  /**
   * Gerar PDF do orçamento
   */
  @Public()
  @Get('quotations/:id/pdf')
  @ApiOperation({ summary: 'Gerar PDF do orçamento' })
  @ApiHeader({ name: 'X-Customer-Token', required: true })
  @ApiResponse({ status: 200, description: 'PDF gerado com sucesso' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  async generateQuotationPdf(
    @Param('id') id: string,
    @Headers('x-customer-token') token: string,
    @Res() res: Response,
  ) {
    const customer = await this.validateCustomer(token);
    const pdfBuffer = await this.customerPortalService.generateQuotationPdf(
      id,
      customer.id,
      customer.tenantId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="orcamento-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }

  /**
   * Gerar PDF da ordem de serviço
   */
  @Public()
  @Get('orders/:id/pdf')
  @ApiOperation({ summary: 'Gerar PDF da ordem de serviço' })
  @ApiHeader({ name: 'X-Customer-Token', required: true })
  @ApiResponse({ status: 200, description: 'PDF gerado com sucesso' })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada' })
  async generateOrderPdf(
    @Param('id') id: string,
    @Headers('x-customer-token') token: string,
    @Res() res: Response,
  ) {
    const customer = await this.validateCustomer(token);
    const pdfBuffer = await this.customerPortalService.generateOrderPdf(
      id,
      customer.id,
      customer.tenantId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ordem-servico-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }

  /**
   * Helper para validar token e retornar customer
   */
  private async validateCustomer(token: string) {
    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }
    return this.customerPortalService.validateToken(token);
  }
}
