import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from '../../modules/subscriptions/services/subscriptions.service';

@Injectable()
export class UsageLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limitCheck = this.reflector.get<string>(
      'limitCheck',
      context.getHandler(),
    );

    if (!limitCheck) {
      return true; // Sem restrição
    }

    try {
      const canProceed =
        await this.subscriptionsService.checkLimit(limitCheck);

      if (!canProceed) {
        throw new ForbiddenException(
          `Limite atingido para ${limitCheck}. Faça upgrade do seu plano para continuar.`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      // Se não encontrar assinatura, permitir (modo degradado)
      return true;
    }
  }
}
