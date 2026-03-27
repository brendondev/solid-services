import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { Observable, interval } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Criar nova conversa' })
  async createConversation(
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.createConversation(dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Listar conversas' })
  async findAllConversations(
    @Query('status') status?: string,
  ) {
    return this.chatService.findAll(status);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Buscar conversa por ID' })
  async findOneConversation(@Param('id') id: string) {
    return this.chatService.findOne(id);
  }

  @Get('conversations/customer/:customerId')
  @ApiOperation({ summary: 'Buscar conversas de um cliente' })
  async findByCustomer(@Param('customerId') customerId: string) {
    return this.chatService.findByCustomer(customerId);
  }

  @Patch('conversations/:id')
  @ApiOperation({ summary: 'Atualizar conversa' })
  async updateConversation(
    @Param('id') id: string,
    @Body() dto: UpdateConversationDto,
  ) {
    return this.chatService.update(id, dto);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Enviar mensagem' })
  async sendMessage(
    @Req() req: any,
    @Body() dto: SendMessageDto,
  ) {
    const senderId = req.user.id;
    return this.chatService.sendMessage(dto, senderId);
  }

  @Post('conversations/:id/read')
  @ApiOperation({ summary: 'Marcar mensagens como lidas' })
  async markAsRead(
    @Req() req: any,
    @Param('id') conversationId: string,
  ) {
    const userId = req.user.id;
    return this.chatService.markMessagesAsRead(conversationId, userId);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Contar mensagens não lidas' })
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.id;
    const count = await this.chatService.getUnreadCount(userId);
    return { count };
  }

  @Sse('stream')
  @ApiOperation({ summary: 'Stream de mensagens em tempo real (SSE)' })
  stream(@Query('conversationId') conversationId: string): Observable<MessageEvent> {
    // Verifica por novas mensagens a cada 2 segundos
    return interval(2000).pipe(
      switchMap(async () => {
        if (!conversationId) {
          return { type: 'ping', data: { timestamp: new Date() } };
        }

        const conversation = await this.chatService.findOne(conversationId);
        const lastMessage = conversation.messages[conversation.messages.length - 1];

        if (!lastMessage) {
          return { type: 'ping', data: { timestamp: new Date() } };
        }

        return { type: 'message', data: lastMessage };
      }),
      map((event) => ({
        data: event,
      })),
    );
  }
}
