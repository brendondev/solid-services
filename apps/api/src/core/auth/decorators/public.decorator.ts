import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para marcar rotas como públicas (não requerem autenticação)
 */
export const Public = () => SetMetadata('isPublic', true);
