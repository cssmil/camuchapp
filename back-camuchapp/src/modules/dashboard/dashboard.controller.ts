
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
  ) {
    return this.dashboardService.getSummary(fecha_inicio, fecha_fin);
  }

  @Get('sales-over-time')
  getSalesOverTime(
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
  ) {
    return this.dashboardService.getSalesOverTime(fecha_inicio, fecha_fin);
  }

  @Get('top-selling-products')
  getTopSellingProducts(
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
  ) {
    return this.dashboardService.getTopSellingProducts(fecha_inicio, fecha_fin);
  }

  @Get('low-stock-products')
  getLowStockProducts() {
    return this.dashboardService.getLowStockProducts();
  }

  @Get('expiring-products')
  getExpiringProducts() {
    return this.dashboardService.getExpiringProducts();
  }
}
