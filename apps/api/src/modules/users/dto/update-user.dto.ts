import { IsString, IsArray, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './create-user.dto';

export class UpdateUserDto {
  @ApiProperty({ example: 'João Silva', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: ['manager', 'technician'],
    enum: UserRole,
    isArray: true,
    required: false
  })
  @IsArray()
  @IsEnum(UserRole, { each: true })
  @IsOptional()
  roles?: UserRole[];

  @ApiProperty({ example: 'active', enum: ['active', 'inactive'], required: false })
  @IsString()
  @IsOptional()
  status?: 'active' | 'inactive';
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'SenhaAntiga123!' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'SenhaNova456!', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
