import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GovBrOAuthConfig } from './interfaces/signature.interface';

/**
 * Service de integração com API de Assinatura Eletrônica do Gov.br
 *
 * Documentação: https://manual-integracao-assinatura-eletronica.servicos.gov.br
 *
 * Responsável por:
 * - Autenticação OAuth 2.0
 * - Assinatura de hash SHA-256
 * - Geração de pacote PKCS#7
 */
@Injectable()
export class GovBrSignatureService {
  private config: GovBrOAuthConfig;

  constructor(private readonly configService: ConfigService) {
    const environment = this.configService.get<string>('GOVBR_ENVIRONMENT', 'staging');

    // URLs por ambiente
    const urls: Record<string, { oauth: string; api: string }> = {
      staging: {
        oauth: 'https://cas.staging.iti.br/oauth2.0',
        api: 'https://assinatura-api.staging.iti.br',
      },
      production: {
        oauth: 'https://cas.iti.br/oauth2.0',
        api: 'https://assinatura-api.iti.br',
      },
    };

    const env = urls[environment] || urls.staging;

    this.config = {
      clientId: this.configService.get<string>('GOVBR_CLIENT_ID') || '',
      clientSecret: this.configService.get<string>('GOVBR_CLIENT_SECRET') || '',
      redirectUri: this.configService.get<string>('GOVBR_REDIRECT_URI') || '',
      oauthUrl: env.oauth,
      baseUrl: env.api,
    };
  }

  /**
   * Gera URL de autorização OAuth do Gov.br
   *
   * O usuário será redirecionado para esta URL para autenticar
   * e autorizar a assinatura
   */
  getAuthUrl(scope: 'sign' | 'signature_session' = 'sign'): string {
    const { clientId, redirectUri, oauthUrl } = this.config;

    if (!clientId || !redirectUri) {
      throw new InternalServerErrorException(
        'Gov.br não está configurado. Configure GOVBR_CLIENT_ID e GOVBR_REDIRECT_URI',
      );
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: `${scope} govbr`, // govbr = certificados Gov.br (assinatura avançada)
      redirect_uri: redirectUri,
      state: this.generateState(),
      nonce: this.generateNonce(),
    });

    return `${oauthUrl}/authorize?${params.toString()}`;
  }

  /**
   * Troca código de autorização por access token
   *
   * @param code Código de autorização retornado pelo OAuth
   * @returns Access token
   */
  async exchangeCodeForToken(code: string): Promise<string> {
    const { clientId, clientSecret, redirectUri, oauthUrl } = this.config;

    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    try {
      const response = await fetch(`${oauthUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[GovBr] Token exchange failed:', error);
        throw new BadRequestException('Falha ao obter access token do Gov.br');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('[GovBr] Token exchange error:', error);
      throw new InternalServerErrorException('Erro ao comunicar com Gov.br');
    }
  }

  /**
   * Assina um hash SHA-256 usando a API do Gov.br
   *
   * @param hashBase64 Hash SHA-256 em Base64 do documento
   * @param accessToken Access token obtido no OAuth
   * @returns Pacote PKCS#7 contendo a assinatura
   */
  async signHash(hashBase64: string, accessToken: string): Promise<Buffer> {
    const { baseUrl } = this.config;

    try {
      const response = await fetch(`${baseUrl}/externo/v2/assinarPKCS7`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ hashBase64 }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[GovBr] Sign hash failed:', error);

        if (response.status === 403) {
          throw new BadRequestException(
            'Conta Gov.br não possui nível de identidade necessário (Prata ou Ouro)',
          );
        }

        throw new BadRequestException('Falha ao assinar documento com Gov.br');
      }

      // Resposta é binária (PKCS#7)
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('[GovBr] Sign hash error:', error);
      throw new InternalServerErrorException('Erro ao comunicar com Gov.br');
    }
  }

  /**
   * Obtém certificado público do usuário
   *
   * @param accessToken Access token obtido no OAuth
   * @returns Certificado em formato PEM
   */
  async getPublicCertificate(accessToken: string): Promise<string> {
    const { baseUrl } = this.config;

    try {
      const response = await fetch(`${baseUrl}/externo/v2/certificadoPublico`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[GovBr] Get certificate failed:', error);
        throw new BadRequestException('Falha ao obter certificado público');
      }

      return await response.text();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('[GovBr] Get certificate error:', error);
      throw new InternalServerErrorException('Erro ao comunicar com Gov.br');
    }
  }

  /**
   * Gera state aleatório para OAuth (segurança CSRF)
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Gera nonce aleatório para OAuth (replay attack prevention)
   */
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
