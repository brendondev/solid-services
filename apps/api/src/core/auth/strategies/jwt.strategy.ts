import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database';
import { JwtPayload } from '../interfaces';

/**
 * Estratégia JWT para autenticação
 *
 * Valida o token JWT e carrega os dados do usuário
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly _configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: _configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Buscar usuário no banco
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Retornar dados do usuário (será anexado ao request)
    // Converter roles de string para array
    const roles = user.roles.split(',').map((r) => r.trim());

    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles,
      name: user.name,
    };
  }
}
