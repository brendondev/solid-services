import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Serviço para validar Cloudflare Turnstile tokens
 *
 * Turnstile é uma alternativa ao reCAPTCHA da Cloudflare.
 * Valida se o usuário completou o desafio CAPTCHA.
 */
@Injectable()
export class TurnstileService {
  private readonly secretKey: string;
  private readonly verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('TURNSTILE_SECRET_KEY') || '';
  }

  /**
   * Valida o token Turnstile com a API da Cloudflare
   *
   * @param token Token recebido do frontend
   * @param remoteIp IP do cliente (opcional)
   * @returns Promise<boolean> true se válido
   */
  async verify(token: string, remoteIp?: string): Promise<boolean> {
    // Se não houver secret key configurada, permitir (Turnstile desabilitado)
    if (!this.secretKey) {
      console.warn('[Turnstile] Secret key not configured - allowing request');
      return true;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('secret', this.secretKey);
      formData.append('response', token);
      if (remoteIp) {
        formData.append('remoteip', remoteIp);
      }

      const response = await fetch(this.verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (!data.success) {
        const errorCodes = data['error-codes'] || [];
        console.error('[Turnstile] Verification failed:', errorCodes);

        // Se for timeout ou duplicate, permitir mesmo assim (token expirado/reutilizado é comum)
        if (errorCodes.includes('timeout-or-duplicate')) {
          console.warn('[Turnstile] Token timeout/duplicate - allowing anyway for better UX');
          return true;
        }

        return false;
      }

      return true;
    } catch (error) {
      console.error('[Turnstile] Verification error:', error);
      // Em caso de erro na verificação, permitir (melhor UX)
      console.warn('[Turnstile] Allowing request due to verification error');
      return true;
    }
  }

  /**
   * Valida o token e lança exceção se inválido
   *
   * @param token Token recebido do frontend
   * @param remoteIp IP do cliente (opcional)
   */
  async verifyOrThrow(token: string, remoteIp?: string): Promise<void> {
    if (!token) {
      throw new UnauthorizedException('Turnstile token is required');
    }

    const isValid = await this.verify(token, remoteIp);

    if (!isValid) {
      throw new UnauthorizedException('Turnstile verification failed. Please try again.');
    }
  }
}
