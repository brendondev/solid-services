import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ImportEntityType {
  CUSTOMERS = 'customers',
  SERVICES = 'services',
  SUPPLIERS = 'suppliers',
  PRODUCTS = 'products',
}

export class AnalyzeImportDto {
  @ApiProperty({ enum: ImportEntityType })
  @IsEnum(ImportEntityType)
  @IsNotEmpty()
  entityType: ImportEntityType;
}

export class ImportPreviewDto {
  data: any[];
  totalRows: number;
  columns: string[];
  validationErrors: ImportValidationError[];
}

export class ImportValidationError {
  row: number;
  column: string;
  value: any;
  error: string;
}

export class ImportResultDto {
  success: number;
  errors: number;
  warnings: number;
  total: number;
  errorDetails: ImportErrorDetail[];
}

export class ImportErrorDetail {
  row: number;
  error: string;
  data?: any;
}
