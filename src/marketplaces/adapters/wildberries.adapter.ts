import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceAdapter, MarketplaceOrderPayload, MarketplaceStockPayload } from './marketplace-adapter.interface';

/**
 * API Wildberries разбит на несколько независимых хостов с общей авторизацией
 * (заголовок Authorization: <ключ>, без "Bearer"). Единого base URL, в отличие
 * от .env.example WB_API_BASE_URL, у него нет — поэтому здесь два хоста,
 * переопределяемые через переменные окружения при необходимости (например,
 * если WB поменяет домен).
 */
const MARKETPLACE_API_URL = process.env.WB_MARKETPLACE_API_URL || 'https://marketplace-api.wildberries.ru';
const ANALYTICS_API_URL = process.env.WB_ANALYTICS_API_URL || 'https://seller-analytics-api.wildberries.ru';

interface WbOrder {
  id: number;
  rid: string;
  createdAt: string;
  warehouseId: number;
  article: string;
  skus: string[];
}

interface WbWarehouseRemainsItem {
  barcode: string;
  quantityWarehousesFull: number;
  warehouses: { warehouseName: string; quantity: number }[];
}

interface WbSupply {
  id: string;
  done: boolean;
  createdAt: string;
  closedAt: string | null;
  name: string;
}

@Injectable()
export class WildberriesAdapter implements MarketplaceAdapter {
  private readonly logger = new Logger(WildberriesAdapter.name);

  private async request<T>(baseUrl: string, path: string, apiKey: string, retriesLeft = 5): Promise<T> {
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, {
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    });

    if (res.status === 429 && retriesLeft > 0) {
      const retryAfterSec = Number(res.headers.get('X-Ratelimit-Retry') ?? res.headers.get('Retry-After') ?? '20');
      this.logger.warn(`WB API ${path}: 429, повтор через ${retryAfterSec}с (осталось попыток: ${retriesLeft})`);
      await new Promise((resolve) => setTimeout(resolve, retryAfterSec * 1000));
      return this.request<T>(baseUrl, path, apiKey, retriesLeft - 1);
    }

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`WB API ${path} вернул ${res.status}: ${text.slice(0, 500)}`);
    }
    return text ? (JSON.parse(text) as T) : (undefined as T);
  }

  async fetchOrders(apiKey: string): Promise<MarketplaceOrderPayload[]> {
    this.logger.log('fetchOrders: запрос новых FBS-заказов к WB Marketplace API');
    const data = await this.request<{ orders: WbOrder[] }>(MARKETPLACE_API_URL, '/api/v3/orders/new', apiKey);
    const orders = data?.orders ?? [];
    return orders.map((order) => ({
      externalOrderNumber: String(order.id),
      productBarcode: order.skus?.[0] ?? '',
      qty: 1,
      productArticle: order.article,
    }));
  }

  /**
   * Старый /api/v1/supplier/stocks (Statistics API) устарел (WB
   * release-notes id=494). Актуальная замена — асинхронный отчёт "Остатки
   * на складах" в Analytics API: создать задачу, дождаться готовности,
   * скачать результат.
   */
  async fetchStock(apiKey: string): Promise<MarketplaceStockPayload[]> {
    this.logger.log('fetchStock: запрос отчёта об остатках к WB Analytics API');

    const createResp = await this.request<{ data: { taskId: string } }>(
      ANALYTICS_API_URL,
      '/api/v1/warehouse_remains?groupByBarcode=true',
      apiKey,
    );
    const taskId = createResp?.data?.taskId;
    if (!taskId) throw new Error('WB API warehouse_remains: не получен taskId');

    const maxAttempts = 15;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 20000));
      const statusResp = await this.request<{ data: { status: string } }>(
        ANALYTICS_API_URL,
        `/api/v1/warehouse_remains/tasks/${taskId}/status`,
        apiKey,
      );
      if (statusResp?.data?.status === 'done') break;
      if (attempt === maxAttempts - 1) throw new Error('WB API warehouse_remains: отчёт не готов, тайм-аут ожидания');
    }

    const items = await this.request<WbWarehouseRemainsItem[]>(
      ANALYTICS_API_URL,
      `/api/v1/warehouse_remains/tasks/${taskId}/download`,
      apiKey,
    );
    return (items ?? []).map((item) => ({
      productBarcode: item.barcode,
      qty: item.quantityWarehousesFull ?? item.warehouses?.reduce((sum, w) => sum + w.quantity, 0) ?? 0,
    }));
  }

  async fetchSupplies(apiKey: string): Promise<unknown[]> {
    this.logger.log('fetchSupplies: запрос поставок к WB Marketplace API');
    const data = await this.request<{ supplies: WbSupply[] }>(
      MARKETPLACE_API_URL,
      '/api/v3/supplies?limit=1000&next=0',
      apiKey,
    );
    return data?.supplies ?? [];
  }

  async pushLabels(apiKey: string, orderNumbers: string[]): Promise<void> {
    this.logger.log(`pushLabels: запрос этикеток для ${orderNumbers.length} заказов к WB Marketplace API`);
    const orders = orderNumbers.map((n) => Number(n));
    const url = `${MARKETPLACE_API_URL}/api/v3/orders/stickers?type=png&width=58&height=40`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`WB API stickers вернул ${res.status}: ${text.slice(0, 500)}`);
    }
  }
}
