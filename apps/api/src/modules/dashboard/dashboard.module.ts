import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DatabaseModule } from '@core/database';
import { TenantModule } from '@core/tenant';

@Module({
  imports: [DatabaseModule, TenantModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
