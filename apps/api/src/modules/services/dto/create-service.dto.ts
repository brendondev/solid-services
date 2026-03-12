import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';

/**
 * DTO para criação de serviço
 */
export class CreateServiceDto {
  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Manutenção Preventiva',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descrição detalhada do serviço',
    example: 'Manutenção preventiva completa de equipamentos',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Preço padrão do serviço',
    example: 150.00,
  })
  @IsNumber()
  @Min(0)
  defaultPrice: number;

  @ApiProperty({
    description: 'Duração estimada em minutos',
    example: 120,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedDuration?: number;

  @ApiProperty({
    description: 'Status do serviço',
    example: 'active',
    enum: ['active', 'inactive'],
    required: false,
  })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}
