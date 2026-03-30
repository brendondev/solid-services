import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { DatabaseModule } from '../../core/database/database.module';
import { CustomersModule } from '../customers/customers.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [DatabaseModule, CustomersModule, ServicesModule],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}
