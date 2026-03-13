import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomerPortalModule } from '../customer-portal';
import { NotificationsModule } from '../notifications';
import { AuditModule } from '../audit';

@Module({
  imports: [CustomerPortalModule, NotificationsModule, AuditModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
