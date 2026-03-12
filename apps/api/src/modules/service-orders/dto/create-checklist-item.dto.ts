import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class CreateChecklistItemDto {
  @ApiProperty({
    description: 'Título do item do checklist',
    example: 'Verificar equipamento',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Ordem do item',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  order: number;
}
