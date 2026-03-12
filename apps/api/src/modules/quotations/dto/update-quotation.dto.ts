import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateQuotationDto } from './create-quotation.dto';

/**
 * DTO para atualização de orçamento
 * Todos os campos são opcionais
 * Status pode ser atualizado separadamente
 */
export class UpdateQuotationDto extends PartialType(OmitType(CreateQuotationDto, ['items'] as const)) {
  @ApiProperty({
    description: 'Status do orçamento',
    enum: ['draft', 'sent', 'approved', 'rejected', 'expired'],
    example: 'sent',
    required: false,
  })
  @IsEnum(['draft', 'sent', 'approved', 'rejected', 'expired'])
  @IsOptional()
  status?: string;
}
