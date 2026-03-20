import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, TenantContextService],
  exports: [UsersService],
})
export class UsersModule {}
