import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsDateString } from 'class-validator';

export class CreateReceivableDto {
  @ApiProperty({
    description: 'ID da ordem de serviço (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  serviceOrderId?: string;

  @ApiProperty({
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  customerId: string;

  @ApiProperty({
    description: 'Valor total a receber',
    example: 300.00,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Data de vencimento',
    example: '2024-03-30T00:00:00Z',
  })
  @IsDateString()
  dueDate: string;

  @ApiProperty({
    description: 'Observações',
    example: 'Referente à OS-2024-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
