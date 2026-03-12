import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database';
import { LoginDto, RegisterDto } from './dto';
import { JwtPayload } from './interfaces';

/**
 * Service de autenticação
 *
 * Responsável por:
 * - Login de usuários
 * - Registro de novos tenants
 * - Geração de tokens JWT
 * - Validação de credenciais
 *
 * Princípios SOLID:
 * - Single Responsibility: Apenas autenticação
 * - Dependency Inversion: Depende de abstrações (PrismaService, JwtService)
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Realiza login do usuário
   */
  async login(loginDto: LoginDto) {
    // Buscar usuário por email (sem filtro de tenant)
    const user = await this.prisma.user.findFirst({
      where: {
        email: loginDto.email,
        status: 'active',
      },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validar senha
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar se tenant está ativo
    if (user.tenant.status !== 'active') {
      throw new UnauthorizedException('Tenant is not active');
    }

    // Gerar tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        tenantId: user.tenantId,
        tenantSlug: user.tenant.slug,
      },
    };
  }

  /**
   * Registra novo tenant e usuário admin
   */
  async register(registerDto: RegisterDto) {
    // Verificar se slug já existe
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: registerDto.tenantSlug },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant slug already exists');
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Criar tenant e usuário admin em uma transação
    const result = await this.prisma.$transaction(async (tx) => {
      // Criar tenant
      const tenant = await tx.tenant.create({
        data: {
          slug: registerDto.tenantSlug,
          name: registerDto.tenantName,
          status: 'active',
        },
      });

      // Criar usuário admin
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: registerDto.email,
          passwordHash,
          name: registerDto.name,
          roles: ['admin'],
          status: 'active',
        },
      });

      return { tenant, user };
    });

    // Gerar tokens
    const { accessToken, refreshToken } = await this.generateTokens(result.user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        roles: result.user.roles,
        tenantId: result.user.tenantId,
        tenantSlug: result.tenant.slug,
      },
    };
  }

  /**
   * Valida e renova o refresh token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      // Buscar usuário
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Gerar novos tokens
      const tokens = await this.generateTokens(user);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Gera access token e refresh token para o usuário
   */
  private async generateTokens(user: any) {
    // Converter roles para array se for string
    const roles = typeof user.roles === 'string'
      ? user.roles.split(',').map((r: string) => r.trim())
      : user.roles;

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Valida se usuário tem as roles necessárias
   */
  hasRoles(userRoles: string | string[], requiredRoles: string[]): boolean {
    const rolesArray = typeof userRoles === 'string' ? userRoles.split(',') : userRoles;
    return requiredRoles.some((role) => rolesArray.includes(role.trim()));
  }
}
