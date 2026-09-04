import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceAdapter, MarketplaceOrderPayload, MarketplaceStockPayload } from './marketplace-adapter.interface';

/**
 * TODO: подключить реальный API Wildberries (https://suppliers-api.wildberries.ru)
 * — получение заказов, карточек, остатков, поставок, статусов, этикеток и штрихкодов (ТЗ §51).
 * Сейчас возвращает пустые данные, чтобы не блокировать остальную систему.
 */
@Injectable()
export class WildberriesAdapter implements MarketplaceAdapter {
  private readonly logger = new Logger(WildberriesAdapter.name);

  async fetchOrders(_apiKey: string): Promise<MarketplaceOrderPayload[]> {
    this.logger.log('fetchOrders: заглушка WB API, реальный вызов не выполнен');
    return [];
  }

  async fetchStock(_apiKey: string): Promise<MarketplaceStockPayload[]> {
    this.logger.log('fetchStock: заглушка WB API, реальный вызов не выполнен');
    return [];
  }

  async fetchSupplies(_apiKey: string): Promise<unknown[]> {
    this.logger.log('fetchSupplies: заглушка WB API, реальный вызов не выполнен');
    return [];
  }

  async pushLabels(_apiKey: string, _orderNumbers: string[]): Promise<void> {
    this.logger.log('pushLabels: заглушка WB API, реальный вызов не выполнен');
  }
}
