import { IsEmail, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './create-user.dto';

/**
 * DTO para convidar novo usuário
 * Sistema gera senha temporária e envia por email
 */
export class InviteUserDto {
  @ApiProperty({ example: 'novo@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: ['technician'],
    enum: UserRole,
    isArray: true
  })
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];
}
