import { PartialType } from '@nestjs/swagger';
import { CreateSupplierDto } from './create-supplier.dto';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @ApiProperty({
    description: 'Status do fornecedor',
    enum: ['active', 'inactive'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: string;
}
