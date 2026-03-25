import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Sse,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, SseAuthGuard } from '@core/auth/guards';
import { NotificationsDataService } from './notifications-data.service';
import { RealTimeService } from './real-time.service';
import { Observable } from 'rxjs';

/**
 * Notifications Controller
 *
 * Endpoints para gerenciar notificações em tempo real
 */
@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsDataService: NotificationsDataService,
    private readonly realTimeService: RealTimeService,
  ) {}

  /**
   * Stream SSE de notificações em tempo real
   * Usa SseAuthGuard para aceitar token via query param (?token=xxx)
   */
  @UseGuards(SseAuthGuard)
  @Sse('stream')
  @ApiOperation({
    summary: 'Conectar ao stream de notificações em tempo real',
    description: 'Passa o token JWT via query param: ?token=xxx'
  })
  stream(@Req() req: any): Observable<any> {
    const tenantId = req.user.tenantId;
    const userId = req.user.sub;

    console.log('[NotificationsController] SSE stream requested:', {
      tenantId,
      userId,
      userName: req.user.name,
      userEmail: req.user.email,
    });

    return this.realTimeService.createStream(tenantId, userId);
  }

  /**
   * Lista notificações do usuário
   */
  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário' })
  async getNotifications(
    @Req() req: any,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    console.log('[NotificationsController] GET /notifications request:', {
      hasUser: !!req.user,
      user: req.user,
      userSub: req.user?.sub,
      userId: req.user?.userId,
      id: req.user?.id,
    });

    const userId = req.user.sub;
    const unread = unreadOnly === 'true';

    console.log('[NotificationsController] Calling findByUser with userId:', userId);

    return this.notificationsDataService.findByUser(userId, unread);
  }

  /**
   * Conta notificações não lidas
   */
  @Get('unread/count')
  @ApiOperation({ summary: 'Contar notificações não lidas' })
  async countUnread(@Req() req: any) {
    const userId = req.user.sub;
    const count = await this.notificationsDataService.countUnread(userId);

    return { count };
  }

  /**
   * Marca notificação como lida
   */
  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationsDataService.markAsRead(id);
  }

  /**
   * Marca todas notificações como lidas
   */
  @Post('read-all')
  @ApiOperation({ summary: 'Marcar todas notificações como lidas' })
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.sub;

    return this.notificationsDataService.markAllAsRead(userId);
  }

  /**
   * Deleta notificação
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Deletar notificação' })
  async deleteNotification(@Param('id') id: string) {
    return this.notificationsDataService.delete(id);
  }
}
