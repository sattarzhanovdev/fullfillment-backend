export interface MarketplaceOrderPayload {
  externalOrderNumber: string;
  productBarcode: string;
  qty: number;
}

export interface MarketplaceStockPayload {
  productBarcode: string;
  qty: number;
}

/**
 * Общий интерфейс адаптера маркетплейса. Реальные реализации должны выполнять
 * HTTP-запросы к API Wildberries/Ozon, используя apiKey интеграции клиента.
 * Текущие реализации — заглушки для дальнейшего расширения (ТЗ §51).
 */
export interface MarketplaceAdapter {
  fetchOrders(apiKey: string): Promise<MarketplaceOrderPayload[]>;
  fetchStock(apiKey: string): Promise<MarketplaceStockPayload[]>;
  fetchSupplies(apiKey: string): Promise<unknown[]>;
  pushLabels(apiKey: string, orderNumbers: string[]): Promise<void>;
}
