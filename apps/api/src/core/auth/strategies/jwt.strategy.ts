import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database';
import { JwtPayload } from '../interfaces';

/**
 * Estratégia JWT para autenticação
 *
 * Valida o token JWT e carrega os dados do usuário.
 * O contexto do tenant é definido pelo TenantContextInterceptor.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly isDev = process.env.NODE_ENV !== 'production';

  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // SECURITY: Logs apenas em desenvolvimento
    if (this.isDev) {
      console.log('[JwtStrategy] Validating token for user:', payload.sub);
    }

    // Buscar usuário no banco SEM filtro de tenant (pois o contexto ainda não foi definido)
    // O TenantContextInterceptor vai definir o contexto DEPOIS
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        tenantId: payload.tenantId, // Validação manual aqui
      },
    });

    if (!user || user.status !== 'active') {
      // SECURITY: Não vazar detalhes em produção
      if (this.isDev) {
        console.error('[JwtStrategy] User not found or inactive:', payload.sub);
      }
      throw new UnauthorizedException('User not found or inactive');
    }

    // Retornar dados do usuário (será anexado ao request)
    // O TenantContextInterceptor usará req.user.tenantId para criar o contexto
    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles,
      name: user.name,
    };
  }
}
