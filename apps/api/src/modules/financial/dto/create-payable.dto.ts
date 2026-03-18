import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min, MaxLength } from 'class-validator';

export class CreatePayableDto {
  @ApiProperty({
    description: 'ID do fornecedor',
    example: 'uuid-do-fornecedor',
    required: false,
  })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty({
    description: 'Descrição da conta a pagar',
    example: 'Aluguel - Março/2024',
  })
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiProperty({
    description: 'Valor total',
    example: 1500.00,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Data de vencimento',
    example: '2024-03-30',
  })
  @IsDateString()
  dueDate: string;

  @ApiProperty({
    description: 'Categoria da despesa',
    example: 'rent',
    enum: ['rent', 'utilities', 'supplies', 'salary', 'tax', 'service', 'other'],
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Observações',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
