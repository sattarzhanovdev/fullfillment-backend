import { Controller, Get, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';

function parseRange(from?: string, to?: string) {
  return {
    from: from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: to ? new Date(to) : new Date(),
  };
}

@Controller('analytics')
@Roles(UserRole.ADMIN, UserRole.DIRECTOR)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('orders')
  orders(@Query('from') from?: string, @Query('to') to?: string) {
    const { from: f, to: t } = parseRange(from, to);
    return this.analyticsService.ordersReport(f, t);
  }

  @Get('warehouse')
  warehouse() {
    return this.analyticsService.warehouseReport();
  }

  @Get('finance')
  finance(@Query('from') from?: string, @Query('to') to?: string) {
    const { from: f, to: t } = parseRange(from, to);
    return this.analyticsService.financeReport(f, t);
  }

  @Get('efficiency')
  efficiency(@Query('from') from?: string, @Query('to') to?: string) {
    const { from: f, to: t } = parseRange(from, to);
    return this.analyticsService.operationalEfficiency(f, t);
  }

  @Get('kpi')
  kpi(@Query('from') from?: string, @Query('to') to?: string) {
    const { from: f, to: t } = parseRange(from, to);
    return this.analyticsService.employeeKpi(f, t);
  }

  @Get('timeseries')
  timeSeries(@Query('from') from?: string, @Query('to') to?: string, @Query('clientId') clientId?: string) {
    const { from: f, to: t } = parseRange(from, to);
    return this.analyticsService.timeSeries(f, t, clientId);
  }

  @Get('top-products')
  topProducts(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('clientId') clientId?: string,
  ) {
    const { from: f, to: t } = parseRange(from, to);
    return this.analyticsService.topProducts(f, t, limit ? Number(limit) : 10, clientId);
  }

  @Get('top-clients')
  topClients(@Query('from') from?: string, @Query('to') to?: string, @Query('limit') limit?: string) {
    const { from: f, to: t } = parseRange(from, to);
    return this.analyticsService.topClients(f, t, limit ? Number(limit) : 10);
  }

  @Get('comparison')
  comparison(@Query('from') from?: string, @Query('to') to?: string) {
    const { from: f, to: t } = parseRange(from, to);
    return this.analyticsService.periodComparison(f, t);
  }
}
