import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  /**
   * `status` não existe no CreateCustomerDto (cliente novo nasce sempre ativo),
   * mas a tela de edição envia o campo junto com os demais dados.
   *
   * Como o ValidationPipe global usa `forbidNonWhitelisted: true`, a requisição
   * inteira era rejeitada com 400 "property status should not exist" — ou seja,
   * editar um cliente pela interface não salvava NADA, nem o CPF. Aceitar o
   * campo aqui conserta a edição e ainda faz o seletor de status funcionar.
   *
   * Continua existindo `PATCH /customers/:id/toggle-status` para alternar o
   * status isoladamente.
   */
  @ApiPropertyOptional({
    description: 'Status do cliente',
    enum: ['active', 'inactive'],
    example: 'active',
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: string;
}
