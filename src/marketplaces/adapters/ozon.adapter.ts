import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceAdapter, MarketplaceOrderPayload, MarketplaceStockPayload } from './marketplace-adapter.interface';

/**
 * TODO: подключить реальный API Ozon Seller (https://api-seller.ozon.ru)
 * — FBS/FBO заказы, остатки, поставки, этикетки (ТЗ §51).
 */
@Injectable()
export class OzonAdapter implements MarketplaceAdapter {
  private readonly logger = new Logger(OzonAdapter.name);

  async fetchOrders(_apiKey: string): Promise<MarketplaceOrderPayload[]> {
    this.logger.log('fetchOrders: заглушка Ozon API, реальный вызов не выполнен');
    return [];
  }

  async fetchStock(_apiKey: string): Promise<MarketplaceStockPayload[]> {
    this.logger.log('fetchStock: заглушка Ozon API, реальный вызов не выполнен');
    return [];
  }

  async fetchSupplies(_apiKey: string): Promise<unknown[]> {
    this.logger.log('fetchSupplies: заглушка Ozon API, реальный вызов не выполнен');
    return [];
  }

  async pushLabels(_apiKey: string, _orderNumbers: string[]): Promise<void> {
    this.logger.log('pushLabels: заглушка Ozon API, реальный вызов не выполнен');
  }
}
