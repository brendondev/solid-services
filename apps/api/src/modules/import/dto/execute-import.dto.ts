import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ImportEntityType } from './analyze-import.dto';

export class ExecuteImportDto {
  @ApiProperty({ enum: ImportEntityType })
  @IsEnum(ImportEntityType)
  @IsNotEmpty()
  entityType: ImportEntityType;
}
