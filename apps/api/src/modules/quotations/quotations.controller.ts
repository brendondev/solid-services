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
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto, UpdateQuotationDto } from './dto';

/**
 * Controller de Quotations (Orçamentos)
 *
 * Responsabilidades:
 * - Gerenciar requisições HTTP de orçamentos
 * - Validar entrada via DTOs
 * - Delegar para o Service
 *
 * Princípios SOLID:
 * - Single Responsibility: Apenas requisições HTTP
 * - Dependency Inversion: Depende de QuotationsService
 */
@ApiTags('Quotations')
@ApiBearerAuth()
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo orçamento' })
  @ApiResponse({ status: 201, description: 'Orçamento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  create(@Body() createQuotationDto: CreateQuotationDto) {
    return this.quotationsService.create(createQuotationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os orçamentos' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por número ou cliente' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'sent', 'approved', 'rejected', 'expired'],
  })
  @ApiResponse({ status: 200, description: 'Lista de orçamentos' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.quotationsService.findAll(page, limit, search, status);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Listar orçamentos pendentes (draft ou sent)' })
  @ApiResponse({ status: 200, description: 'Lista de orçamentos pendentes' })
  findPending() {
    return this.quotationsService.findPending();
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Buscar orçamentos por cliente' })
  @ApiResponse({ status: 200, description: 'Orçamentos do cliente' })
  findByCustomer(@Param('customerId') customerId: string) {
    return this.quotationsService.findByCustomer(customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar orçamento por ID' })
  @ApiResponse({ status: 200, description: 'Orçamento encontrado' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  findOne(@Param('id') id: string) {
    return this.quotationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar orçamento' })
  @ApiResponse({ status: 200, description: 'Orçamento atualizado' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  update(@Param('id') id: string, @Body() updateQuotationDto: UpdateQuotationDto) {
    return this.quotationsService.update(id, updateQuotationDto);
  }

  @Patch(':id/status/:status')
  @ApiOperation({ summary: 'Atualizar status do orçamento' })
  @ApiResponse({ status: 200, description: 'Status atualizado' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  updateStatus(@Param('id') id: string, @Param('status') status: string) {
    return this.quotationsService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar orçamento' })
  @ApiResponse({ status: 200, description: 'Orçamento deletado' })
  @ApiResponse({ status: 400, description: 'Não é possível deletar orçamento aprovado' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  remove(@Param('id') id: string) {
    return this.quotationsService.remove(id);
  }
}
