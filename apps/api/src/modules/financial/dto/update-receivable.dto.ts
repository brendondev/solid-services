import { PartialType } from '@nestjs/swagger';
import { CreateReceivableDto } from './create-receivable.dto';

export class UpdateReceivableDto extends PartialType(CreateReceivableDto) {}
