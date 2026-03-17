import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database';
import { TenantContextService } from '../../tenant';
import { JwtPayload } from '../interfaces';

/**
 * Estratégia JWT para autenticação
 *
 * Valida o token JWT, carrega os dados do usuário E define o contexto do tenant
 *
 * IMPORTANTE: Este é o momento crítico onde o tenantId é extraído do JWT
 * e definido no contexto para isolar dados entre tenants.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    console.log('[JwtStrategy] Validating token for user:', payload.sub, 'tenant:', payload.tenantId);

    // CRÍTICO: Definir contexto do tenant IMEDIATAMENTE
    // Isso garante que todas as queries do Prisma sejam filtradas pelo tenant correto
    if (payload.tenantId) {
      this.tenantContext.setTenantId(payload.tenantId);
      this.tenantContext.setUserId(payload.sub);
      console.log('[JwtStrategy] Tenant context set:', payload.tenantId);
    }

    // Buscar usuário no banco (já filtrado pelo tenant devido ao contexto)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status !== 'active') {
      console.error('[JwtStrategy] User not found or inactive:', payload.sub);
      throw new UnauthorizedException('User not found or inactive');
    }

    // Verificação de segurança: garantir que o tenantId do JWT corresponde ao do usuário
    if (user.tenantId !== payload.tenantId) {
      console.error('[JwtStrategy] Tenant mismatch! JWT tenant:', payload.tenantId, 'User tenant:', user.tenantId);
      throw new UnauthorizedException('Invalid tenant');
    }

    console.log('[JwtStrategy] User validated successfully:', {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles,
    });

    // Retornar dados do usuário (será anexado ao request)
    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles,
      name: user.name,
    };
  }
}
