import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para verificar se ainda tem espaço dentro do limite do plano
 *
 * @param metric - Nome da métrica de limite (ex: 'maxCustomers', 'maxOrders', 'maxUsers')
 *
 * @example
 * ```typescript
 * @Post('customers')
 * @CheckLimit('maxCustomers')
 * async createCustomer(@Body() dto: CreateCustomerDto) {
 *   // Só executa se ainda tiver espaço no limite de customers
 * }
 * ```
 */
export const CheckLimit = (metric: string) =>
  SetMetadata('limitCheck', metric);
