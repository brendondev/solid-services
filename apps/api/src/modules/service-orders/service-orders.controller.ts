import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ServiceOrdersService } from './service-orders.service';
import { CreateServiceOrderDto, UpdateServiceOrderDto, UpdateChecklistItemDto } from './dto';

@ApiTags('Service Orders')
@ApiBearerAuth()
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova ordem de serviço' })
  @ApiResponse({ status: 201, description: 'Ordem criada com sucesso' })
  create(@Body() createServiceOrderDto: CreateServiceOrderDto) {
    return this.serviceOrdersService.create(createServiceOrderDto);
  }

  @Post('from-quotation/:quotationId')
  @ApiOperation({ summary: 'Criar ordem a partir de orçamento aprovado' })
  @ApiResponse({ status: 201, description: 'Ordem criada a partir do orçamento' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado ou não aprovado' })
  @ApiResponse({ status: 400, description: 'Ordem já existe para este orçamento' })
  createFromQuotation(@Param('quotationId') quotationId: string) {
    return this.serviceOrdersService.createFromQuotation(quotationId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as ordens de serviço' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['open', 'scheduled', 'in_progress', 'completed', 'cancelled'],
  })
  @ApiResponse({ status: 200, description: 'Lista de ordens' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.serviceOrdersService.findAll(page, limit, search, status);
  }

  @Get('scheduled/:date')
  @ApiOperation({ summary: 'Buscar ordens agendadas para uma data' })
  @ApiResponse({ status: 200, description: 'Ordens agendadas' })
  findScheduled(@Param('date') date: string) {
    return this.serviceOrdersService.findScheduled(new Date(date));
  }

  @Get('technician/:technicianId')
  @ApiOperation({ summary: 'Buscar ordens por técnico' })
  @ApiResponse({ status: 200, description: 'Ordens do técnico' })
  findByTechnician(@Param('technicianId') technicianId: string) {
    return this.serviceOrdersService.findByTechnician(technicianId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ordem por ID' })
  @ApiResponse({ status: 200, description: 'Ordem encontrada' })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada' })
  findOne(@Param('id') id: string) {
    return this.serviceOrdersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar ordem de serviço' })
  @ApiResponse({ status: 200, description: 'Ordem atualizada' })
  update(@Param('id') id: string, @Body() updateServiceOrderDto: UpdateServiceOrderDto) {
    return this.serviceOrdersService.update(id, updateServiceOrderDto);
  }

  @Patch(':id/status/:status')
  @ApiOperation({ summary: 'Atualizar status da ordem' })
  @ApiResponse({ status: 200, description: 'Status atualizado' })
  updateStatus(
    @Param('id') id: string,
    @Param('status') status: string,
    @Body('description') description?: string,
  ) {
    return this.serviceOrdersService.updateStatus(id, status, description);
  }

  @Patch(':id/checklist/:checklistId')
  @ApiOperation({ summary: 'Atualizar item do checklist' })
  @ApiResponse({ status: 200, description: 'Checklist atualizado' })
  updateChecklistItem(
    @Param('id') id: string,
    @Param('checklistId') checklistId: string,
    @Body() dto: UpdateChecklistItemDto,
  ) {
    return this.serviceOrdersService.updateChecklistItem(id, checklistId, dto);
  }

  @Post(':id/timeline')
  @ApiOperation({ summary: 'Adicionar evento à timeline' })
  @ApiResponse({ status: 201, description: 'Evento adicionado' })
  addTimelineEvent(
    @Param('id') id: string,
    @Body('event') event: string,
    @Body('description') description?: string,
    @Body('metadata') metadata?: any,
  ) {
    return this.serviceOrdersService.addTimelineEvent(id, event, description, metadata);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar ordem de serviço' })
  @ApiResponse({ status: 200, description: 'Ordem deletada' })
  @ApiResponse({ status: 400, description: 'Não é possível deletar ordem completada' })
  remove(@Param('id') id: string) {
    return this.serviceOrdersService.remove(id);
  }
}
