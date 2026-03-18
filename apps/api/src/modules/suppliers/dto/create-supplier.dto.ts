import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'Nome do fornecedor',
    example: 'Fornecedor ABC Ltda',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Documento (CPF ou CNPJ)',
    example: '12.345.678/0001-90',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  document?: string;

  @ApiProperty({
    description: 'Email do fornecedor',
    example: 'contato@fornecedorabc.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Telefone do fornecedor',
    example: '(11) 98765-4321',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    description: 'Observações sobre o fornecedor',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
