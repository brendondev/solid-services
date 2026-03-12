import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { CreateServiceOrderDto } from './create-service-order.dto';

export class UpdateServiceOrderDto extends PartialType(
  OmitType(CreateServiceOrderDto, ['items', 'checklists'] as const),
) {
  @ApiProperty({
    description: 'Status da ordem de serviço',
    enum: ['open', 'scheduled', 'in_progress', 'completed', 'cancelled'],
    example: 'scheduled',
    required: false,
  })
  @IsEnum(['open', 'scheduled', 'in_progress', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'Data/hora de início',
    example: '2024-03-15T14:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startedAt?: string;

  @ApiProperty({
    description: 'Data/hora de conclusão',
    example: '2024-03-15T16:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  completedAt?: string;
}
