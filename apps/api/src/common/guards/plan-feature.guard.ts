import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from '../../modules/subscriptions/services/subscriptions.service';

@Injectable()
export class PlanFeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<string>(
      'requiredFeature',
      context.getHandler(),
    );

    if (!requiredFeature) {
      return true; // Sem restrição
    }

    try {
      const hasFeature =
        await this.subscriptionsService.hasFeature(requiredFeature);

      if (!hasFeature) {
        throw new ForbiddenException(
          `Esta funcionalidade requer um plano superior. Feature necessária: ${requiredFeature}`,
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
