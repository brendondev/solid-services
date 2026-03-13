import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key para roles
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator @Roles()
 *
 * Define quais roles podem acessar um endpoint
 *
 * @example
 * @Roles('admin')
 * @Delete(':id')
 * remove(@Param('id') id: string) {}
 *
 * @example
 * @Roles('admin', 'manager')
 * @Post()
 * create(@Body() dto: CreateDto) {}
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
