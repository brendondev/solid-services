import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/auth';
import { Public } from '@core/auth/decorators/public.decorator';
import { Request } from 'express';
import { SubscriptionsService } from '../services/subscriptions.service';
import {
  PlanDto,
  SubscriptionDto,
  SubscriptionStatusDto,
} from '../dto/plan.dto';
import {
  UpdateSubscriptionDto,
  CancelSubscriptionDto,
} from '../dto/update-subscription.dto';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  // ============================================================================
  // PLANS (Público - não requer autenticação)
  // ============================================================================

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'Listar todos os planos disponíveis' })
  async getAllPlans(): Promise<PlanDto[]> {
    return this.subscriptionsService.getAllPlans();
  }

  @Public()
  @Get('plans/:slug')
  @ApiOperation({ summary: 'Obter detalhes de um plano específico' })
  async getPlanBySlug(@Param('slug') slug: string): Promise<PlanDto> {
    return this.subscriptionsService.getPlanBySlug(slug);
  }

  // ============================================================================
  // SUBSCRIPTION
  // ============================================================================

  @Get('current')
  @ApiOperation({ summary: 'Obter assinatura atual do tenant' })
  async getCurrentSubscription(): Promise<SubscriptionDto> {
    return this.subscriptionsService.getCurrentSubscription();
  }

  @Get('status')
  @ApiOperation({
    summary: 'Obter status completo da assinatura (com uso e limites)',
  })
  async getSubscriptionStatus(@Req() req: Request & { user: any }): Promise<SubscriptionStatusDto> {
    return this.subscriptionsService.getSubscriptionStatus(req.user.tenantId);
  }

  @Patch('update')
  @ApiOperation({ summary: 'Atualizar assinatura (upgrade/downgrade)' })
  async updateSubscription(
    @Body() dto: UpdateSubscriptionDto,
  ): Promise<SubscriptionDto> {
    return this.subscriptionsService.updateSubscription(dto);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancelar assinatura' })
  async cancelSubscription(
    @Body() dto: CancelSubscriptionDto,
  ): Promise<SubscriptionDto> {
    return this.subscriptionsService.cancelSubscription(dto);
  }

  @Post('reactivate')
  @ApiOperation({ summary: 'Reativar assinatura cancelada' })
  async reactivateSubscription(): Promise<SubscriptionDto> {
    return this.subscriptionsService.reactivateSubscription();
  }

  // ============================================================================
  // FEATURE CHECKS
  // ============================================================================

  @Get('features/:featureName')
  @ApiOperation({ summary: 'Verificar se o plano tem uma feature específica' })
  async hasFeature(
    @Param('featureName') featureName: string,
  ): Promise<{ hasFeature: boolean }> {
    const hasFeature =
      await this.subscriptionsService.hasFeature(featureName);
    return { hasFeature };
  }

  @Get('limits/:metric')
  @ApiOperation({ summary: 'Verificar se ainda tem espaço no limite' })
  async checkLimit(
    @Param('metric') metric: string,
  ): Promise<{ canProceed: boolean }> {
    const canProceed = await this.subscriptionsService.checkLimit(metric);
    return { canProceed };
  }
}
