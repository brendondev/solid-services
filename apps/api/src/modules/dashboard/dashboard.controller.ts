import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('operational')
  @ApiOperation({ summary: 'Dashboard operacional completo' })
  @ApiResponse({ status: 200, description: 'Métricas operacionais' })
  getOperationalDashboard() {
    return this.dashboardService.getOperationalDashboard();
  }

  @Get('quick-stats')
  @ApiOperation({ summary: 'Estatísticas rápidas' })
  @ApiResponse({ status: 200, description: 'Métricas para header/sidebar' })
  getQuickStats() {
    return this.dashboardService.getQuickStats();
  }

  @Get('monthly-performance')
  @ApiOperation({ summary: 'Performance do mês atual' })
  @ApiResponse({ status: 200, description: 'Métricas mensais' })
  getMonthlyPerformance() {
    return this.dashboardService.getMonthlyPerformance();
  }
}
