import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsDateString, IsEnum } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Valor pago',
    example: 300.00,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Método de pagamento',
    enum: ['cash', 'pix', 'credit_card', 'debit_card', 'bank_transfer', 'check'],
    example: 'pix',
  })
  @IsEnum(['cash', 'pix', 'credit_card', 'debit_card', 'bank_transfer', 'check'])
  method: string;

  @ApiProperty({
    description: 'Data do pagamento',
    example: '2024-03-15T14:30:00Z',
  })
  @IsDateString()
  paidAt: string;

  @ApiProperty({
    description: 'Observações sobre o pagamento',
    example: 'Pagamento via PIX',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
