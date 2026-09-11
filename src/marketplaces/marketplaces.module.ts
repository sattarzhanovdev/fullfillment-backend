import { Module } from '@nestjs/common';
import { MarketplacesService } from './marketplaces.service';
import { MarketplacesController } from './marketplaces.controller';
import { WildberriesAdapter } from './adapters/wildberries.adapter';
import { OzonAdapter } from './adapters/ozon.adapter';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [OrdersModule, ProductsModule],
  controllers: [MarketplacesController],
  providers: [MarketplacesService, WildberriesAdapter, OzonAdapter],
  exports: [MarketplacesService, WildberriesAdapter],
})
export class MarketplacesModule {}
