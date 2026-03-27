import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantContextService } from '../../core/tenant/tenant-context.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Cria uma nova conversa
   */
  async createConversation(dto: CreateConversationDto) {
    const tenantId = this.tenantContext.getTenantId();

    // Verifica se já existe conversa aberta para este cliente
    const existing = await this.prisma.conversation.findFirst({
      where: {
        tenantId,
        customerId: dto.customerId,
        status: 'open',
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.conversation.create({
      data: {
        tenantId,
        customerId: dto.customerId,
        title: dto.title,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Lista conversas do tenant
   */
  async findAll(status?: string) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.conversation.findMany({
      where: {
        tenantId,
        ...(status && { status }),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderType: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                read: false,
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });
  }

  /**
   * Busca conversa por ID
   */
  async findOne(id: string) {
    const tenantId = this.tenantContext.getTenantId();

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            attachments: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    return conversation;
  }

  /**
   * Busca conversas de um cliente
   */
  async findByCustomer(customerId: string) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.conversation.findMany({
      where: {
        tenantId,
        customerId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                read: false,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Atualiza conversa
   */
  async update(id: string, dto: UpdateConversationDto) {
    const tenantId = this.tenantContext.getTenantId();

    const conversation = await this.prisma.conversation.findFirst({
      where: { id, tenantId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    return this.prisma.conversation.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Envia mensagem
   */
  async sendMessage(dto: SendMessageDto, senderId: string) {
    const tenantId = this.tenantContext.getTenantId();

    // Verifica se conversa existe
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: dto.conversationId,
        tenantId,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    // Cria mensagem
    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId: dto.conversationId,
        senderId,
        senderType: dto.senderType,
        content: dto.content,
      },
    });

    // Atualiza lastMessageAt da conversa
    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: {
        lastMessageAt: new Date(),
      },
    });

    return message;
  }

  /**
   * Marca mensagens como lidas
   */
  async markMessagesAsRead(conversationId: string, senderId: string) {
    const tenantId = this.tenantContext.getTenantId();

    // Verifica se conversa existe
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        tenantId,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    // Marca como lidas apenas mensagens que não foram enviadas pelo próprio usuário
    await this.prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderId: {
          not: senderId,
        },
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Conta mensagens não lidas
   */
  async getUnreadCount(userId?: string) {
    const tenantId = this.tenantContext.getTenantId();

    const where: any = {
      conversation: {
        tenantId,
      },
      read: false,
    };

    // Se userId fornecido, conta apenas mensagens que não foram enviadas por ele
    if (userId) {
      where.senderId = {
        not: userId,
      };
    }

    return this.prisma.chatMessage.count({
      where,
    });
  }
}
