import { Module } from '@nestjs/common';
import { MarketplacesService } from './marketplaces.service';
import { MarketplacesController } from './marketplaces.controller';
import { WildberriesAdapter } from './adapters/wildberries.adapter';
import { OzonAdapter } from './adapters/ozon.adapter';

@Module({
  controllers: [MarketplacesController],
  providers: [MarketplacesService, WildberriesAdapter, OzonAdapter],
  exports: [MarketplacesService],
})
export class MarketplacesModule {}
