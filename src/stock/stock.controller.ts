import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private stockService: StockService) {}

  @Get()
  findMany(
    @Query('clientId') clientId?: string,
    @Query('productId') productId?: string,
    @Query('article') article?: string,
    @Query('barcode') barcode?: string,
    @Query('name') name?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('zoneId') zoneId?: string,
    @Query('cellId') cellId?: string,
  ) {
    return this.stockService.findMany({ clientId, productId, article, barcode, name, warehouseId, zoneId, cellId });
  }

  @Get('product/:productId/totals')
  getTotals(@Param('productId') productId: string) {
    return this.stockService.getTotalsForProduct(productId);
  }

  @Get('product/:productId/showcase')
  getShowcase(@Param('productId') productId: string) {
    return this.stockService.showcaseQtyForProduct(productId);
  }

  @Post('product/:productId/preview-buffer')
  previewBuffer(@Param('productId') productId: string, @Body('bufferPercent') bufferPercent: number) {
    return this.stockService.previewBuffer(productId, bufferPercent);
  }
}
