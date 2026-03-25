import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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

  @Get('revenue-history')
  @ApiOperation({ summary: 'Histórico de receita dos últimos meses' })
  @ApiResponse({ status: 200, description: 'Receita recebida e total por mês' })
  @ApiQuery({ name: 'months', required: false, type: Number, description: 'Número de meses (padrão: 6)' })
  getRevenueHistory(@Query('months') months?: string) {
    const monthsNumber = months ? parseInt(months, 10) : 6;
    return this.dashboardService.getRevenueHistory(monthsNumber);
  }

  @Get('orders-history')
  @ApiOperation({ summary: 'Histórico de ordens dos últimos meses' })
  @ApiResponse({ status: 200, description: 'Ordens criadas, concluídas e canceladas por mês' })
  @ApiQuery({ name: 'months', required: false, type: Number, description: 'Número de meses (padrão: 6)' })
  getOrdersHistory(@Query('months') months?: string) {
    const monthsNumber = months ? parseInt(months, 10) : 6;
    return this.dashboardService.getOrdersHistory(monthsNumber);
  }

  @Get('top-customers')
  @ApiOperation({ summary: 'Top clientes por receita do mês atual' })
  @ApiResponse({ status: 200, description: 'Clientes que mais geraram receita' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número de clientes (padrão: 5)' })
  getTopCustomers(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 5;
    return this.dashboardService.getTopCustomers(limitNumber);
  }
}
