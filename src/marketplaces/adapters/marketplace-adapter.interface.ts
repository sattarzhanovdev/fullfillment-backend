export interface MarketplaceOrderPayload {
  externalOrderNumber: string;
  productBarcode: string;
  qty: number;
  /** Артикул продавца, если маркетплейс его отдаёт — используется для авто-заведения карточки товара. */
  productArticle?: string;
}

export interface MarketplaceStockPayload {
  productBarcode: string;
  qty: number;
}

export interface MarketplaceProductCatalogItem {
  barcode: string;
  name: string;
  article: string;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  weightKg?: number;
}

export interface MarketplaceLabelItem {
  orderNumber: string;
  contentType: string;
  /** base64-содержимое файла этикетки. */
  fileBase64: string;
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
  fetchProductCatalog(apiKey: string): Promise<MarketplaceProductCatalogItem[]>;
  fetchLabels(apiKey: string, orderNumbers: string[]): Promise<MarketplaceLabelItem[]>;
}
