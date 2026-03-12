import { PartialType } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto';

/**
 * DTO para atualização de serviço
 * Todos os campos são opcionais
 */
export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
