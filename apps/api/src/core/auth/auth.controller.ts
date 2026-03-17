import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Public } from './decorators';

/**
 * Controller de autenticação
 *
 * SECURITY: Endpoints públicos com rate limiting rigoroso para prevenir
 * brute force attacks.
 *
 * Rate limits:
 * - Login: 5 tentativas por minuto por IP
 * - Register: 3 tentativas por minuto por IP
 * - Refresh: 10 tentativas por minuto por IP
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentativas por minuto
  @ApiOperation({ summary: 'Login de usuário' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 429, description: 'Muitas tentativas de login. Tente novamente em 1 minuto.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 tentativas por minuto
  @ApiOperation({ summary: 'Registro de novo tenant e usuário admin' })
  @ApiResponse({ status: 201, description: 'Tenant criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Tenant slug já existe' })
  @ApiResponse({ status: 429, description: 'Muitas tentativas de registro. Tente novamente em 1 minuto.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 tentativas por minuto
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  @ApiResponse({ status: 200, description: 'Token renovado com sucesso' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  @ApiResponse({ status: 429, description: 'Muitas tentativas de refresh. Tente novamente em 1 minuto.' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
