import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuotationItemDto } from './create-quotation-item.dto';

/**
 * DTO para criação de orçamento
 */
export class CreateQuotationDto {
  @ApiProperty({
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  customerId: string;

  @ApiProperty({
    description: 'Data de validade do orçamento',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString()
  validUntil: string;

  @ApiProperty({
    description: 'Observações sobre o orçamento',
    example: 'Orçamento para manutenção preventiva + instalação',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Itens do orçamento',
    type: [CreateQuotationItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationItemDto)
  items: CreateQuotationItemDto[];
}
