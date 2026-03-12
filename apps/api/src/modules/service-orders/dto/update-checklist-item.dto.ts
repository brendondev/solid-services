import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateChecklistItemDto {
  @ApiProperty({
    description: 'Item completado ou não',
    example: true,
  })
  @IsBoolean()
  isCompleted: boolean;
}
