import { IsEmail, IsString, IsArray, IsEnum, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TECHNICIAN = 'technician',
  VIEWER = 'viewer',
}

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'joao@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SenhaForte123!', minLength: 8, required: false })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @IsOptional()
  password?: string;

  @ApiProperty({
    example: ['manager'],
    enum: UserRole,
    isArray: true,
    description: 'Roles do usuário: admin, manager, technician, viewer'
  })
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];
}
