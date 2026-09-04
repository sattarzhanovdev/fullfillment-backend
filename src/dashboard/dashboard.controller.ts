import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('trend')
  getTrend(@Query('days') days?: string) {
    return this.dashboardService.getTrend(days ? Number(days) : 14);
  }

  @Get('attention')
  getAttention() {
    return this.dashboardService.getAttentionOrders();
  }

  @Get('low-stock')
  getLowStock() {
    return this.dashboardService.getLowStockProducts();
  }

  @Get('recent-orders')
  getRecentOrders() {
    return this.dashboardService.getRecentOrders();
  }

  @Get('upcoming-shipments')
  getUpcomingShipments() {
    return this.dashboardService.getUpcomingShipments();
  }
}
