import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'ID do serviço',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  serviceId: string;

  @ApiProperty({
    description: 'Descrição do serviço',
    example: 'Manutenção preventiva completa',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Quantidade',
    example: 1,
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
