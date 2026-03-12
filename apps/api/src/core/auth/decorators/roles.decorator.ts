import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para definir roles necessárias para acessar uma rota
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
