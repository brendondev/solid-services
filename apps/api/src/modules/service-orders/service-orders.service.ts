import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { StorageService } from '@core/storage';
import { CreateServiceOrderDto, UpdateServiceOrderDto, UpdateChecklistItemDto } from './dto';

@Injectable()
export class ServiceOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly storage: StorageService,
  ) {}

  /**
   * Gera número sequencial para a ordem
   */
  private async generateOrderNumber(): Promise<string> {
    const tenantId = this.tenantContext.getTenantId();
    const year = new Date().getFullYear();

    const count = await this.prisma.serviceOrder.count({
      where: {
        tenantId,
        number: {
          startsWith: `OS-${year}-`,
        },
      },
    });

    const nextNumber = count + 1;
    return `OS-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Calcula total da ordem
   */
  private calculateTotal(items: { quantity: number; unitPrice: number }[]): number {
    return items.reduce((total, item) => {
      return total + item.quantity * item.unitPrice;
    }, 0);
  }

  /**
   * Cria uma nova ordem de serviço
   */
  async create(createServiceOrderDto: CreateServiceOrderDto) {
    const tenantId = this.tenantContext.getTenantId();
    const number = await this.generateOrderNumber();

    // Preparar itens com totais
    const itemsData = createServiceOrderDto.items.map((item) => ({
      serviceId: item.serviceId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
      order: item.order,
    }));

    const totalAmount = this.calculateTotal(itemsData);

    // Determinar status inicial
    let status = 'open';
    if (createServiceOrderDto.scheduledFor) {
      status = 'scheduled';
    }

    const data: any = {
      tenantId,
      customerId: createServiceOrderDto.customerId,
      quotationId: createServiceOrderDto.quotationId,
      number,
      status,
      assignedTo: createServiceOrderDto.assignedTo,
      scheduledFor: createServiceOrderDto.scheduledFor
        ? new Date(createServiceOrderDto.scheduledFor)
        : undefined,
      totalAmount,
      notes: createServiceOrderDto.notes,
      items: {
        create: itemsData,
      },
      timeline: {
        create: [
          {
            event: 'created',
            description: 'Ordem de serviço criada',
          },
        ],
      },
    };

    // Adicionar checklist se fornecido
    if (createServiceOrderDto.checklists && createServiceOrderDto.checklists.length > 0) {
      data.checklists = {
        create: createServiceOrderDto.checklists.map((item) => ({
          title: item.title,
          isCompleted: false,
          order: item.order,
        })),
      };
    }

    return this.prisma.serviceOrder.create({
      data,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        checklists: {
          orderBy: {
            order: 'asc',
          },
        },
        timeline: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  /**
   * Cria ordem a partir de um orçamento aprovado
   */
  async createFromQuotation(quotationId: string) {
    const tenantId = this.tenantContext.getTenantId();

    // Buscar orçamento
    const quotation = await this.prisma.quotation.findFirst({
      where: {
        id: quotationId,
        tenantId,
        status: 'approved',
      },
      include: {
        items: {
          include: {
            service: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!quotation) {
      throw new NotFoundException('Approved quotation not found');
    }

    // Verificar se já existe ordem para este orçamento
    const existing = await this.prisma.serviceOrder.findFirst({
      where: {
        quotationId,
      },
    });

    if (existing) {
      throw new BadRequestException('Service order already exists for this quotation');
    }

    const number = await this.generateOrderNumber();

    // Converter items do orçamento para items da ordem
    const itemsData = quotation.items.map((item, index) => ({
      serviceId: item.serviceId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      order: index + 1,
    }));

    return this.prisma.serviceOrder.create({
      data: {
        tenantId,
        customerId: quotation.customerId,
        quotationId: quotation.id,
        number,
        status: 'open',
        totalAmount: quotation.totalAmount,
        items: {
          create: itemsData,
        },
        timeline: {
          create: [
            {
              event: 'created',
              description: `Ordem criada a partir do orçamento ${quotation.number}`,
            },
          ],
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            service: true,
          },
        },
        timeline: true,
      },
    });
  }

  /**
   * Lista todas as ordens
   */
  async findAll(page: number = 1, limit: number = 10, search?: string, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.serviceOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          assignedUser: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              items: true,
              checklists: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.serviceOrder.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca uma ordem por ID
   */
  async findOne(id: string) {
    const order = await this.prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            contacts: true,
            addresses: true,
          },
        },
        quotation: {
          select: {
            id: true,
            number: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            service: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        checklists: {
          orderBy: {
            order: 'asc',
          },
        },
        timeline: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        attachments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        receivables: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Service order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Atualiza uma ordem
   */
  async update(id: string, updateServiceOrderDto: UpdateServiceOrderDto) {
    await this.findOne(id);

    const data: any = { ...updateServiceOrderDto };

    if (updateServiceOrderDto.scheduledFor) {
      data.scheduledFor = new Date(updateServiceOrderDto.scheduledFor);
    }

    if (updateServiceOrderDto.startedAt) {
      data.startedAt = new Date(updateServiceOrderDto.startedAt);
    }

    if (updateServiceOrderDto.completedAt) {
      data.completedAt = new Date(updateServiceOrderDto.completedAt);
    }

    return this.prisma.serviceOrder.update({
      where: { id },
      data,
      include: {
        customer: true,
        assignedUser: true,
        items: {
          include: {
            service: true,
          },
        },
        checklists: true,
        timeline: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  /**
   * Atualiza status da ordem
   */
  async updateStatus(id: string, status: string, description?: string) {
    const order = await this.findOne(id);

    const data: any = { status };

    // Atualizar timestamps baseado no status
    if (status === 'in_progress' && !order.startedAt) {
      data.startedAt = new Date();
    }

    if (status === 'completed' && !order.completedAt) {
      data.completedAt = new Date();
    }

    return this.prisma.serviceOrder.update({
      where: { id },
      data: {
        ...data,
        timeline: {
          create: {
            event: status,
            description: description || `Status alterado para ${status}`,
          },
        },
      },
      include: {
        timeline: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  /**
   * Adiciona item ao checklist
   */
  async addChecklistItem(orderId: string, title: string) {
    await this.findOne(orderId);

    // Buscar a última ordem para incrementar
    const lastItem = await this.prisma.orderChecklist.findFirst({
      where: { serviceOrderId: orderId },
      orderBy: { order: 'desc' },
    });

    const nextOrder = lastItem ? lastItem.order + 1 : 1;

    return this.prisma.orderChecklist.create({
      data: {
        serviceOrderId: orderId,
        title,
        order: nextOrder,
        isCompleted: false,
      },
    });
  }

  /**
   * Atualiza item do checklist
   */
  async updateChecklistItem(orderId: string, checklistId: string, dto: UpdateChecklistItemDto) {
    await this.findOne(orderId);

    const data: any = {
      isCompleted: dto.isCompleted,
    };

    if (dto.isCompleted) {
      data.completedAt = new Date();
    } else {
      data.completedAt = null;
    }

    return this.prisma.orderChecklist.update({
      where: { id: checklistId },
      data,
    });
  }

  /**
   * Adiciona evento à timeline
   */
  async addTimelineEvent(orderId: string, event: string, description?: string, metadata?: any) {
    await this.findOne(orderId);

    return this.prisma.orderTimeline.create({
      data: {
        serviceOrderId: orderId,
        event,
        description,
        metadata,
      },
    });
  }

  /**
   * Remove uma ordem
   */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.serviceOrder.delete({
      where: { id },
    });
  }

  /**
   * Busca ordens agendadas para uma data
   */
  async findScheduled(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.serviceOrder.findMany({
      where: {
        scheduledFor: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['scheduled', 'in_progress'],
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });
  }

  /**
   * Busca ordens por técnico
   */
  async findByTechnician(technicianId: string) {
    return this.prisma.serviceOrder.findMany({
      where: {
        assignedTo: technicianId,
        status: {
          in: ['scheduled', 'in_progress'],
        },
      },
      include: {
        customer: true,
        items: true,
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });
  }

  /**
   * Upload de anexo
   */
  async uploadAttachment(
    orderId: string,
    file: Express.Multer.File,
    _description?: string, // Não usado por enquanto - pode ser adicionado ao schema depois
  ) {
    const tenantId = this.tenantContext.getTenantId();

    // Validar ordem
    const order = await this.prisma.serviceOrder.findFirst({
      where: {
        id: orderId,
        tenantId,
      },
    });

    if (!order) {
      throw new NotFoundException('Ordem de serviço não encontrada');
    }

    // Validar tamanho (max 10MB)
    if (!this.storage.validateFileSize(file.size, 10)) {
      throw new BadRequestException('Arquivo muito grande (máx 10MB)');
    }

    // Validar extensão
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip'];
    if (!this.storage.validateFileExtension(file.originalname, allowedExtensions)) {
      throw new BadRequestException(
        `Tipo de arquivo não permitido. Extensões permitidas: ${allowedExtensions.join(', ')}`
      );
    }

    // Upload para S3
    const fileKey = await this.storage.uploadFile(
      file.buffer,
      tenantId,
      'service-orders',
      file.originalname,
    );

    // Criar registro no banco
    const attachment = await this.prisma.attachment.create({
      data: {
        serviceOrderId: orderId,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        storageKey: fileKey,
      },
    });

    // Adicionar evento na timeline
    await this.addTimelineEvent(
      orderId,
      'attachment_uploaded',
      `Anexo adicionado: ${file.originalname}`,
      { attachmentId: attachment.id },
    );

    return attachment;
  }

  /**
   * Gera URL de download do anexo
   */
  async getAttachmentDownloadUrl(orderId: string, attachmentId: string) {
    const tenantId = this.tenantContext.getTenantId();

    // Validar anexo
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        serviceOrder: {
          id: orderId,
          tenantId,
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException('Anexo não encontrado');
    }

    // Gerar URL assinada (válida por 1 hora)
    const url = await this.storage.getSignedDownloadUrl(attachment.storageKey, 3600);

    return {
      url,
      fileName: attachment.fileName,
      fileSize: attachment.fileSize,
      mimeType: attachment.mimeType,
      expiresIn: 3600,
    };
  }

  /**
   * Deleta anexo
   */
  async deleteAttachment(orderId: string, attachmentId: string) {
    const tenantId = this.tenantContext.getTenantId();

    // Validar anexo
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        serviceOrder: {
          id: orderId,
          tenantId,
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException('Anexo não encontrado');
    }

    // Deletar do S3
    await this.storage.deleteFile(attachment.storageKey);

    // Deletar do banco
    await this.prisma.attachment.delete({
      where: {
        id: attachmentId,
      },
    });

    // Adicionar evento na timeline
    await this.addTimelineEvent(
      orderId,
      'attachment_deleted',
      `Anexo removido: ${attachment.fileName}`,
    );

    return { message: 'Anexo deletado com sucesso' };
  }
}
