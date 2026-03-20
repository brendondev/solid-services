import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto, ChangePasswordDto } from '../dto/update-user.dto';
import { InviteUserDto } from '../dto/invite-user.dto';
import { Roles } from '@core/auth/decorators';
import { RolesGuard } from '@core/auth/guards';

/**
 * Controller de gerenciamento de usuários
 *
 * Endpoints protegidos por roles:
 * - Listagem: admin, manager
 * - CRUD: apenas admin
 * - Mudança de senha própria: qualquer usuário autenticado
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Lista todos os usuários do tenant
   */
  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Listar todos os usuários do tenant' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  async findAll() {
    return this.usersService.findAll();
  }

  /**
   * Busca usuário por ID
   */
  @Get(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Cria novo usuário manualmente
   */
  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Criar novo usuário (apenas admin)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  /**
   * Convida novo usuário (gera senha temporária)
   */
  @Post('invite')
  @Roles('admin')
  @ApiOperation({
    summary: 'Convidar novo usuário com senha temporária',
    description: 'Gera senha temporária e cria usuário. Futuramente enviará email.',
  })
  @ApiResponse({ status: 201, description: 'Convite enviado com sucesso' })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  async invite(@Body() dto: InviteUserDto) {
    return this.usersService.invite(dto);
  }

  /**
   * Atualiza usuário
   */
  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar usuário (apenas admin)' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  /**
   * Remove usuário (soft delete)
   */
  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remover usuário (apenas admin)' })
  @ApiResponse({ status: 200, description: 'Usuário removido' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 400, description: 'Não é possível remover o último admin' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  /**
   * Muda senha do próprio usuário
   */
  @Patch('me/change-password')
  @ApiOperation({ summary: 'Mudar própria senha' })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso' })
  @ApiResponse({ status: 401, description: 'Senha atual incorreta' })
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.sub, dto);
  }

  /**
   * Reseta senha do usuário (admin only)
   */
  @Post(':id/reset-password')
  @Roles('admin')
  @ApiOperation({ summary: 'Resetar senha de usuário (apenas admin)' })
  @ApiResponse({ status: 200, description: 'Senha resetada, nova senha temporária gerada' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }
}
