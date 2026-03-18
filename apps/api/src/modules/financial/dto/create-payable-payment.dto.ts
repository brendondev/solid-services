import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreatePayablePaymentDto {
  @ApiProperty({
    description: 'Valor do pagamento',
    example: 1500.00,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Método de pagamento',
    example: 'pix',
    enum: ['cash', 'pix', 'bank_transfer', 'debit_card', 'credit_card', 'check'],
  })
  @IsString()
  method: string;

  @ApiProperty({
    description: 'Data do pagamento',
    example: '2024-03-15T14:30:00Z',
  })
  @IsDateString()
  paidAt: string;

  @ApiProperty({
    description: 'Observações',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
