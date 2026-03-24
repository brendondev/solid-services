import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard, Public } from '@core/auth';
import { DigitalSignatureService } from './digital-signature.service';
import { SignDocumentDto } from './dto';

/**
 * Controller de Assinatura Digital
 *
 * Endpoints para assinatura de documentos (orçamentos e ordens de serviço)
 * usando Gov.br ou assinatura local.
 */
@ApiTags('Digital Signature')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('digital-signature')
export class DigitalSignatureController {
  constructor(
    private readonly digitalSignatureService: DigitalSignatureService,
  ) {}

  /**
   * Assina um documento
   */
  @Public()
  @Post('sign')
  @ApiOperation({
    summary: 'Assina um documento',
    description:
      'Assina um orçamento ou ordem de serviço usando Gov.br ou assinatura local',
  })
  @ApiResponse({ status: 201, description: 'Documento assinado com sucesso' })
  @ApiResponse({ status: 400, description: 'Documento já assinado ou inválido' })
  @ApiResponse({ status: 404, description: 'Documento não encontrado' })
  async signDocument(@Req() req: any, @Body() dto: SignDocumentDto) {
    // Suporta tanto JWT (dashboard) quanto portal token
    const userId = req.user?.id || req.user?.sub || 'portal-user';
    return this.digitalSignatureService.signDocument(userId, dto);
  }

  /**
   * Obtém URL de autorização OAuth do Gov.br
   */
  @Get('govbr/auth-url')
  @ApiOperation({
    summary: 'Obtém URL de autorização OAuth do Gov.br',
    description:
      'Retorna a URL para redirecionar o usuário para autenticação no Gov.br',
  })
  @ApiQuery({
    name: 'scope',
    required: false,
    enum: ['sign', 'signature_session'],
    description:
      'Escopo da assinatura: "sign" para uma assinatura, "signature_session" para múltiplas',
  })
  @ApiResponse({ status: 200, description: 'URL de autorização' })
  getGovBrAuthUrl(@Query('scope') scope: 'sign' | 'signature_session' = 'sign') {
    const authUrl = this.digitalSignatureService.getGovBrAuthUrl(scope);
    return {
      authUrl,
      instructions:
        'Redirecione o usuário para esta URL. Após autenticação, ele será redirecionado de volta com um código de autorização.',
    };
  }

  /**
   * Troca código de autorização por access token
   */
  @Post('govbr/exchange-token')
  @ApiOperation({
    summary: 'Troca código de autorização por access token',
    description:
      'Após o usuário autenticar no Gov.br, use este endpoint para obter o access token',
  })
  @ApiResponse({ status: 200, description: 'Access token obtido com sucesso' })
  @ApiResponse({ status: 400, description: 'Código de autorização inválido' })
  async exchangeGovBrToken(@Body('code') code: string) {
    const accessToken =
      await this.digitalSignatureService.exchangeGovBrCode(code);
    return {
      accessToken,
      expiresIn: 600, // 10 minutos (Gov.br padrão)
      usage:
        'Use este token no campo govbrAccessToken ao assinar documentos',
    };
  }
}
