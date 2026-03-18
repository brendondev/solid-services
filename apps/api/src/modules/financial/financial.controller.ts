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
  ParseBoolPipe,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import {
  CreateReceivableDto,
  CreatePaymentDto,
  UpdateReceivableDto,
  CreatePayableDto,
  UpdatePayableDto,
  CreatePayablePaymentDto,
} from './dto';
import { AuditService } from '../audit';

@ApiTags('Financial')
@ApiBearerAuth()
@Controller('financial')
export class FinancialController {
  constructor(
    private readonly financialService: FinancialService,
    private readonly auditService: AuditService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard financeiro' })
  @ApiResponse({ status: 200, description: 'Resumo financeiro' })
  getDashboard() {
    return this.financialService.getDashboard();
  }

  @Post('receivables')
  @ApiOperation({ summary: 'Criar recebível' })
  @ApiResponse({ status: 201, description: 'Recebível criado' })
  createReceivable(@Body() createReceivableDto: CreateReceivableDto) {
    return this.financialService.createReceivable(createReceivableDto);
  }

  @Post('receivables/from-order/:orderId')
  @ApiOperation({ summary: 'Criar recebível a partir de ordem completada' })
  @ApiResponse({ status: 201, description: 'Recebível criado' })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada' })
  createFromServiceOrder(@Param('orderId') orderId: string) {
    return this.financialService.createFromServiceOrder(orderId);
  }

  @Get('receivables')
  @ApiOperation({ summary: 'Listar recebíveis' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'partial', 'paid', 'overdue'] })
  @ApiQuery({ name: 'overdue', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de recebíveis' })
  findAllReceivables(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('overdue', new DefaultValuePipe(false), ParseBoolPipe) overdue?: boolean,
  ) {
    return this.financialService.findAllReceivables(page, limit, status, overdue);
  }

  @Get('receivables/customer/:customerId')
  @ApiOperation({ summary: 'Buscar recebíveis por cliente' })
  @ApiResponse({ status: 200, description: 'Recebíveis do cliente' })
  findByCustomer(@Param('customerId') customerId: string) {
    return this.financialService.findByCustomer(customerId);
  }

  @Get('receivables/:id')
  @ApiOperation({ summary: 'Buscar recebível por ID' })
  @ApiResponse({ status: 200, description: 'Recebível encontrado' })
  @ApiResponse({ status: 404, description: 'Recebível não encontrado' })
  findOneReceivable(@Param('id') id: string) {
    return this.financialService.findOneReceivable(id);
  }

  @Patch('receivables/:id')
  @ApiOperation({ summary: 'Atualizar recebível' })
  @ApiResponse({ status: 200, description: 'Recebível atualizado' })
  updateReceivable(@Param('id') id: string, @Body() updateReceivableDto: UpdateReceivableDto) {
    return this.financialService.updateReceivable(id, updateReceivableDto);
  }

  @Post('receivables/:id/payments')
  @ApiOperation({ summary: 'Registrar pagamento' })
  @ApiResponse({ status: 201, description: 'Pagamento registrado' })
  @ApiResponse({ status: 400, description: 'Valor excede pendente' })
  async registerPayment(
    @Param('id') id: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: any,
  ) {
    const payment = await this.financialService.registerPayment(id, createPaymentDto, req.user.id);

    // Audit log
    await this.auditService.log({
      userId: req.user.id,
      action: 'PAYMENT_REGISTERED',
      entity: 'Receivable',
      entityId: id,
      changes: {
        paymentId: payment.id,
        amount: createPaymentDto.amount,
        method: createPaymentDto.method,
      },
    });

    return payment;
  }

  @Delete('receivables/:id')
  @ApiOperation({ summary: 'Deletar recebível' })
  @ApiResponse({ status: 200, description: 'Recebível deletado' })
  @ApiResponse({ status: 400, description: 'Não é possível deletar com pagamentos' })
  removeReceivable(@Param('id') id: string) {
    return this.financialService.removeReceivable(id);
  }

  // ============================================================================
  // PAYABLES (Contas a Pagar)
  // ============================================================================

  @Post('payables')
  @ApiOperation({ summary: 'Criar conta a pagar' })
  @ApiResponse({ status: 201, description: 'Conta a pagar criada' })
  createPayable(@Body() createPayableDto: CreatePayableDto) {
    return this.financialService.createPayable(createPayableDto);
  }

  @Get('payables')
  @ApiOperation({ summary: 'Listar contas a pagar' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'partial', 'paid', 'overdue'] })
  @ApiQuery({ name: 'overdue', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de contas a pagar' })
  findAllPayables(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('overdue', new DefaultValuePipe(false), ParseBoolPipe) overdue?: boolean,
  ) {
    return this.financialService.findAllPayables(page, limit, status, overdue);
  }

  @Get('payables/supplier/:supplierId')
  @ApiOperation({ summary: 'Buscar contas a pagar por fornecedor' })
  @ApiResponse({ status: 200, description: 'Contas a pagar do fornecedor' })
  findPayablesBySupplier(@Param('supplierId') supplierId: string) {
    return this.financialService.findPayablesBySupplier(supplierId);
  }

  @Get('payables/:id')
  @ApiOperation({ summary: 'Buscar conta a pagar por ID' })
  @ApiResponse({ status: 200, description: 'Conta a pagar encontrada' })
  @ApiResponse({ status: 404, description: 'Conta a pagar não encontrada' })
  findOnePayable(@Param('id') id: string) {
    return this.financialService.findOnePayable(id);
  }

  @Patch('payables/:id')
  @ApiOperation({ summary: 'Atualizar conta a pagar' })
  @ApiResponse({ status: 200, description: 'Conta a pagar atualizada' })
  updatePayable(@Param('id') id: string, @Body() updatePayableDto: UpdatePayableDto) {
    return this.financialService.updatePayable(id, updatePayableDto);
  }

  @Post('payables/:id/payments')
  @ApiOperation({ summary: 'Registrar pagamento de conta a pagar' })
  @ApiResponse({ status: 201, description: 'Pagamento registrado' })
  @ApiResponse({ status: 400, description: 'Valor excede pendente' })
  async registerPayablePayment(
    @Param('id') id: string,
    @Body() createPayablePaymentDto: CreatePayablePaymentDto,
    @Request() req: any,
  ) {
    const payment = await this.financialService.registerPayablePayment(
      id,
      createPayablePaymentDto,
      req.user.id,
    );

    // Audit log
    await this.auditService.log({
      userId: req.user.id,
      action: 'PAYABLE_PAYMENT_REGISTERED',
      entity: 'Payable',
      entityId: id,
      changes: {
        paymentId: payment.id,
        amount: createPayablePaymentDto.amount,
        method: createPayablePaymentDto.method,
      },
    });

    return payment;
  }

  @Delete('payables/:id')
  @ApiOperation({ summary: 'Deletar conta a pagar' })
  @ApiResponse({ status: 200, description: 'Conta a pagar deletada' })
  @ApiResponse({ status: 400, description: 'Não é possível deletar com pagamentos' })
  removePayable(@Param('id') id: string) {
    return this.financialService.removePayable(id);
  }
}
