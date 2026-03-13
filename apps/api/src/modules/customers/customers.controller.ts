import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';
import { Roles, CurrentUser } from '@core/auth';
import { CustomerPortalService } from '../customer-portal';
import { NotificationsService } from '../notifications';
import { AuditService } from '../audit';

/**
 * Controller de Customers
 *
 * Endpoints para gerenciamento de clientes
 *
 * Todos os endpoints requerem autenticação (JwtAuthGuard global)
 */
@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly customerPortalService: CustomerPortalService,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser('id') userId: string,
  ) {
    const customer = await this.customersService.create(createCustomerDto);

    // Audit log
    await this.auditService.logCreate({
      userId,
      entity: 'Customer',
      entityId: customer.id,
      data: { name: customer.name, type: customer.type },
    });

    return customer;
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de clientes' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.customersService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search,
    );
  }

  @Get('active')
  @ApiOperation({ summary: 'Listar apenas clientes ativos' })
  @ApiResponse({ status: 200, description: 'Lista de clientes ativos' })
  findActive() {
    return this.customersService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser('id') userId: string,
  ) {
    const oldCustomer = await this.customersService.findOne(id);
    const updated = await this.customersService.update(id, updateCustomerDto);

    // Audit log
    await this.auditService.logUpdate({
      userId,
      entity: 'Customer',
      entityId: id,
      oldData: { name: oldCustomer.name, type: oldCustomer.type, status: oldCustomer.status },
      newData: { name: updated.name, type: updated.type, status: updated.status },
    });

    return updated;
  }

  @Post(':id/portal-token')
  @ApiOperation({ summary: 'Gerar token de acesso ao portal do cliente' })
  @ApiResponse({
    status: 200,
    description: 'Token gerado com sucesso',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        expiresIn: { type: 'string' },
        portalUrl: { type: 'string' },
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async generatePortalToken(@Param('id') id: string) {
    const token = await this.customerPortalService.generateAccessToken(id);

    // URL do portal (configurável via env)
    const portalBaseUrl = process.env.PORTAL_URL || 'http://localhost:3001/portal';
    const portalUrl = `${portalBaseUrl}/access?token=${token}`;

    return {
      token,
      expiresIn: '7 dias',
      portalUrl,
    };
  }

  @Post(':id/send-portal-access')
  @ApiOperation({ summary: 'Gerar e enviar por email o acesso ao portal' })
  @ApiResponse({
    status: 200,
    description: 'Email enviado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado ou sem email' })
  async sendPortalAccess(@Param('id') id: string) {
    // Buscar cliente com contato primário
    const customer = await this.customersService.findOne(id);

    // Verificar se tem email
    const primaryContact = customer.contacts?.find((c: any) => c.isPrimary);
    if (!primaryContact?.email) {
      return {
        success: false,
        message: 'Cliente não possui email de contato cadastrado',
      };
    }

    // Gerar token
    const token = await this.customerPortalService.generateAccessToken(id);
    const portalBaseUrl = process.env.PORTAL_URL || 'http://localhost:3001/portal';
    const portalUrl = `${portalBaseUrl}/access?token=${token}`;

    // Enviar email
    await this.notificationsService.sendPortalAccess({
      to: primaryContact.email,
      customerName: customer.name,
      portalUrl,
      expiresIn: '7 dias',
    });

    return {
      success: true,
      message: `Email enviado para ${primaryContact.email}`,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  @ApiOperation({ summary: 'Remover cliente (soft delete)' })
  @ApiResponse({ status: 204, description: 'Cliente removido' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão (apenas admin)' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const customer = await this.customersService.findOne(id);
    await this.customersService.remove(id);

    // Audit log
    await this.auditService.logDelete({
      userId,
      entity: 'Customer',
      entityId: id,
      data: { name: customer.name, type: customer.type },
    });
  }
}
