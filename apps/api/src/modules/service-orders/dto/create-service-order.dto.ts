import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';
import { CreateChecklistItemDto } from './create-checklist-item.dto';

export class CreateServiceOrderDto {
  @ApiProperty({
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  customerId: string;

  @ApiProperty({
    description: 'ID do orçamento (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  quotationId?: string;

  @ApiProperty({
    description: 'ID do técnico responsável (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiProperty({
    description: 'Data/hora agendada (opcional)',
    example: '2024-03-15T14:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  scheduledFor?: string;

  @ApiProperty({
    description: 'Observações',
    example: 'Levar equipamento X',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Itens da ordem de serviço',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({
    description: 'Checklist da ordem de serviço',
    type: [CreateChecklistItemDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChecklistItemDto)
  @IsOptional()
  checklists?: CreateChecklistItemDto[];
}
