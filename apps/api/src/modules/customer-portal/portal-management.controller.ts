import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles } from '@core/auth';
import { CustomerPortalService } from './customer-portal.service';

/**
 * Portal Management Controller
 *
 * Endpoints protegidos para admins gerenciarem tokens de portal
 */
@ApiTags('Portal Management')
@ApiBearerAuth()
@Controller('portal/management')
@UseGuards(JwtAuthGuard)
@Roles('admin', 'manager')
export class PortalManagementController {
  constructor(private readonly customerPortalService: CustomerPortalService) {}

  /**
   * Gera token de acesso ao portal para um cliente (admin only)
   */
  @Post('generate-token/:customerId')
  @ApiOperation({ summary: 'Gerar token de acesso ao portal para um cliente' })
  @ApiResponse({ status: 201, description: 'Token gerado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async generateToken(@Param('customerId') customerId: string) {
    const token = await this.customerPortalService.generateAccessToken(customerId);

    // Determinar URL do frontend
    const frontendUrl = process.env.FRONTEND_URL
      || process.env.NEXT_PUBLIC_BASE_URL
      || (process.env.NODE_ENV === 'production'
        ? 'https://solid-services-api.vercel.app'
        : 'http://localhost:3001');

    return {
      token,
      portalUrl: `${frontendUrl}/portal/${token}`,
      message: 'Token gerado com sucesso. O cliente deve validar o token no primeiro acesso.',
    };
  }

  /**
   * Obter status do token de um cliente
   */
  @Get('token-status/:customerId')
  @ApiOperation({ summary: 'Obter status do token de acesso de um cliente' })
  @ApiResponse({ status: 200, description: 'Status do token' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado ou sem token' })
  async getTokenStatus(@Param('customerId') customerId: string) {
    const tokenInfo = await this.customerPortalService.getCustomerToken(customerId);

    if (!tokenInfo) {
      return {
        hasToken: false,
        message: 'Cliente não possui token de acesso ativo',
      };
    }

    const frontendUrl = process.env.FRONTEND_URL
      || process.env.NEXT_PUBLIC_BASE_URL
      || 'https://solid-services-api.vercel.app';

    return {
      hasToken: true,
      token: tokenInfo.token,
      portalUrl: `${frontendUrl}/portal/${tokenInfo.token}`,
      isValidated: tokenInfo.isValidated,
      validatedAt: tokenInfo.validatedAt,
      generatedAt: tokenInfo.generatedAt,
      lastUsedAt: tokenInfo.lastUsedAt,
      status: tokenInfo.isValidated ? 'Validado e ativo' : 'Aguardando primeira validação',
    };
  }

  /**
   * Revogar token de acesso ao portal
   */
  @Delete('revoke-token/:customerId')
  @ApiOperation({ summary: 'Revogar (cancelar) token de acesso ao portal de um cliente' })
  @ApiResponse({ status: 200, description: 'Token revogado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async revokeToken(@Param('customerId') customerId: string) {
    await this.customerPortalService.revokeToken(customerId);

    return {
      success: true,
      message: 'Token de acesso revogado com sucesso. O cliente não poderá mais acessar o portal.',
    };
  }
}
