import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, ChangePasswordDto } from './dto/update-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';

/**
 * Service de gerenciamento de usuários
 *
 * Funcionalidades:
 * - CRUD de usuários dentro do tenant
 * - Convites com senha temporária
 * - Mudança de senha
 * - Gerenciamento de roles
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Lista todos os usuários do tenant
   */
  async findAll() {
    const tenantId = this.tenantContext.getTenantId();

    const users = await this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  /**
   * Busca usuário por ID
   */
  async findOne(id: string) {
    const tenantId = this.tenantContext.getTenantId();

    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  /**
   * Cria novo usuário manualmente (com senha)
   */
  async create(dto: CreateUserDto) {
    const tenantId = this.tenantContext.getTenantId();

    // Verificar se email já existe no tenant
    const existing = await this.prisma.user.findFirst({
      where: {
        tenantId,
        email: dto.email,
      },
    });

    if (existing) {
      throw new ConflictException('Email já está em uso neste tenant');
    }

    // Hash da senha (ou gera temporária se não fornecida)
    const password = dto.password || this.generateTempPassword();
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        name: dto.name,
        passwordHash,
        roles: dto.roles,
        status: 'active',
      },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        status: true,
        createdAt: true,
      },
    });

    // Se senha foi gerada, retornar ela (para mostrar ao admin)
    return {
      ...user,
      ...(dto.password ? {} : { tempPassword: password }),
    };
  }

  /**
   * Convida novo usuário (gera senha temporária e envia email)
   */
  async invite(dto: InviteUserDto) {
    const tenantId = this.tenantContext.getTenantId();

    // Verificar se email já existe
    const existing = await this.prisma.user.findFirst({
      where: {
        tenantId,
        email: dto.email,
      },
    });

    if (existing) {
      throw new ConflictException('Usuário com este email já existe');
    }

    // Gerar senha temporária
    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        name: dto.email.split('@')[0], // Nome temporário (usuário deve mudar)
        passwordHash,
        roles: dto.roles,
        status: 'active',
      },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        status: true,
      },
    });

    // TODO: Enviar email com link de ativação + senha temporária
    // await this.emailService.sendUserInvite(user.email, tempPassword);

    return {
      ...user,
      tempPassword, // Retornar senha para admin compartilhar (temporário)
      message: 'Usuário convidado com sucesso. Senha temporária gerada.',
    };
  }

  /**
   * Atualiza usuário
   */
  async update(id: string, dto: UpdateUserDto) {
    const tenantId = this.tenantContext.getTenantId();

    // Verificar se usuário existe
    const existing = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Não permitir que usuário remova todas as suas roles de admin se for o único admin
    if (dto.roles && !dto.roles.includes('admin' as any) && existing.roles.includes('admin')) {
      const adminCount = await this.prisma.user.count({
        where: {
          tenantId,
          roles: { has: 'admin' },
          status: 'active',
        },
      });

      if (adminCount === 1) {
        throw new BadRequestException(
          'Não é possível remover o papel de admin do último administrador ativo',
        );
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.roles && { roles: dto.roles }),
        ...(dto.status && { status: dto.status }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        status: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Remove usuário (soft delete - muda status para inactive)
   */
  async remove(id: string) {
    const tenantId = this.tenantContext.getTenantId();

    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Não permitir deletar o último admin
    if (user.roles.includes('admin')) {
      const adminCount = await this.prisma.user.count({
        where: {
          tenantId,
          roles: { has: 'admin' },
          status: 'active',
        },
      });

      if (adminCount === 1) {
        throw new BadRequestException(
          'Não é possível remover o último administrador ativo',
        );
      }
    }

    // Soft delete
    await this.prisma.user.update({
      where: { id },
      data: { status: 'inactive' },
    });

    return { message: 'Usuário removido com sucesso' };
  }

  /**
   * Muda senha do usuário
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    // Hash da nova senha
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  /**
   * Reseta senha do usuário (apenas admin)
   */
  async resetPassword(id: string) {
    const tenantId = this.tenantContext.getTenantId();

    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Gerar nova senha temporária
    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    // TODO: Enviar email com nova senha
    // await this.emailService.sendPasswordReset(user.email, tempPassword);

    return {
      message: 'Senha resetada com sucesso',
      tempPassword, // Retornar para admin compartilhar
    };
  }

  /**
   * Gera senha temporária aleatória
   */
  private generateTempPassword(): string {
    return crypto.randomBytes(8).toString('hex'); // 16 caracteres
  }
}
