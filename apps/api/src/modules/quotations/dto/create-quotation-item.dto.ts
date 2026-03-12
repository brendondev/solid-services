import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

/**
 * DTO para item de orçamento
 */
export class CreateQuotationItemDto {
  @ApiProperty({
    description: 'ID do serviço',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  serviceId: string;

  @ApiProperty({
    description: 'Descrição do item (override do serviço)',
    example: 'Manutenção preventiva completa',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Quantidade',
    example: 2,
  })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({
    description: 'Preço unitário',
    example: 150.00,
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({
    description: 'Ordem do item',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  order: number;
}
