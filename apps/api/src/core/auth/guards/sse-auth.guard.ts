import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database';

/**
 * Guard para proteger rotas SSE com autenticação JWT via query param
 *
 * EventSource não suporta headers customizados, então aceitamos
 * o token via query param: ?token=xxx
 */
@Injectable()
export class SseAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Tentar extrair token do query param
    const token = request.query.token;

    if (!token) {
      console.log('[SseAuthGuard] ❌ Token não fornecido');
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      // Verificar e decodificar o token
      const payload = this.jwtService.verify(token);
      console.log('[SseAuthGuard] ✅ Token verificado:', { sub: payload.sub, tenantId: payload.tenantId });

      // Buscar usuário
      const user = await this.prisma.withoutTenant(async () => {
        return await this.prisma.user.findFirst({
          where: {
            id: payload.sub,
            tenantId: payload.tenantId,
            status: 'active',
          },
        });
      }, true);

      if (!user) {
        console.log('[SseAuthGuard] ❌ Usuário não encontrado:', { sub: payload.sub, tenantId: payload.tenantId });
        throw new UnauthorizedException('Usuário não encontrado ou inativo');
      }

      console.log('[SseAuthGuard] ✅ Usuário autenticado:', { id: user.id, email: user.email });

      // Anexar dados do usuário ao request (mesmo formato do JwtStrategy)
      request.user = {
        id: user.id,
        sub: user.id,
        email: user.email,
        tenantId: user.tenantId,
        roles: user.roles,
        name: user.name,
      };

      return true;
    } catch (error) {
      console.log('[SseAuthGuard] ❌ Erro ao validar token:', error.message);
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
