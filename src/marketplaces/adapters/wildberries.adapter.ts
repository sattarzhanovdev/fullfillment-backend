import { Injectable, Logger } from '@nestjs/common';
import {
  MarketplaceAdapter,
  MarketplaceLabelItem,
  MarketplaceOrderPayload,
  MarketplaceProductCatalogItem,
  MarketplaceStockPayload,
} from './marketplace-adapter.interface';

/**
 * API Wildberries разбит на несколько независимых хостов с общей авторизацией
 * (заголовок Authorization: <ключ>, без "Bearer"). Единого base URL, в отличие
 * от .env.example WB_API_BASE_URL, у него нет — поэтому здесь два хоста,
 * переопределяемые через переменные окружения при необходимости (например,
 * если WB поменяет домен).
 */
const MARKETPLACE_API_URL = process.env.WB_MARKETPLACE_API_URL || 'https://marketplace-api.wildberries.ru';
const ANALYTICS_API_URL = process.env.WB_ANALYTICS_API_URL || 'https://seller-analytics-api.wildberries.ru';
const CONTENT_API_URL = process.env.WB_CONTENT_API_URL || 'https://content-api.wildberries.ru';

interface WbOrder {
  id: number;
  rid: string;
  createdAt: string;
  warehouseId: number;
  article: string;
  skus: string[];
}

interface WbCard {
  vendorCode: string;
  title?: string;
  subjectName?: string;
  dimensions?: { length?: number; width?: number; height?: number; weightBrutto?: number };
  sizes: { techSize?: string; skus: string[] }[];
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

export interface WbShippingPoint {
  id: number;
  name: string;
  address: string;
  city: string;
  officeType: 'sc' | 'sw' | 'pp';
  cargoTypes: number[];
}

@Injectable()
export class WildberriesAdapter implements MarketplaceAdapter {
  private readonly logger = new Logger(WildberriesAdapter.name);

  private async request<T>(
    baseUrl: string,
    path: string,
    apiKey: string,
    options: { method?: string; body?: unknown } = {},
    retriesLeft = 5,
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, {
      method: options.method ?? 'GET',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });

    if (res.status === 429 && retriesLeft > 0) {
      const retryAfterSec = Number(res.headers.get('X-Ratelimit-Retry') ?? res.headers.get('Retry-After') ?? '20');
      this.logger.warn(`WB API ${path}: 429, повтор через ${retryAfterSec}с (осталось попыток: ${retriesLeft})`);
      await new Promise((resolve) => setTimeout(resolve, retryAfterSec * 1000));
      return this.request<T>(baseUrl, path, apiKey, options, retriesLeft - 1);
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

  /**
   * Весь каталог товаров продавца (название, габариты, вес) через WB
   * Content API — так реальные заказы матчатся с полноценными карточками
   * товара, а не с черновиками "название неизвестно". Один WB-товар может
   * иметь несколько размеров/штрихкодов — разворачиваем в отдельные записи
   * по штрихкоду, как того требует локальная модель Product.
   */
  async fetchProductCatalog(apiKey: string): Promise<MarketplaceProductCatalogItem[]> {
    this.logger.log('fetchProductCatalog: запрос каталога карточек к WB Content API');
    const result: MarketplaceProductCatalogItem[] = [];
    let cursor: Record<string, unknown> = { limit: 100 };

    for (let page = 0; page < 100; page++) {
      const data = await this.request<{ cards: WbCard[]; cursor: { total: number; nmID?: number; updatedAt?: string } }>(
        CONTENT_API_URL,
        '/content/v2/get/cards/list',
        apiKey,
        { method: 'POST', body: { settings: { cursor, filter: { withPhoto: -1 } } } },
      );
      const cards = data?.cards ?? [];
      for (const card of cards) {
        const dims = card.dimensions;
        for (const size of card.sizes ?? []) {
          for (const barcode of size.skus ?? []) {
            result.push({
              barcode,
              name: card.title || card.subjectName || card.vendorCode,
              article: card.vendorCode,
              lengthCm: dims?.length || undefined,
              widthCm: dims?.width || undefined,
              heightCm: dims?.height || undefined,
              weightKg: dims?.weightBrutto || undefined,
            });
          }
        }
      }
      if (!data?.cursor || cards.length < 100) break;
      cursor = { limit: 100, updatedAt: data.cursor.updatedAt, nmID: data.cursor.nmID };
    }

    return result;
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

  /** Создаёт реальную поставку в WB (POST /api/v3/supplies) — возвращает её id для дальнейших операций. */
  async createSupply(apiKey: string, name: string): Promise<{ id: string }> {
    this.logger.log(`createSupply: создание поставки "${name}" в WB Marketplace API`);
    return this.request<{ id: string }>(MARKETPLACE_API_URL, '/api/v3/supplies', apiKey, {
      method: 'POST',
      body: { name },
    });
  }

  /**
   * Присоединяет заказ (реальный числовой id заказа WB) к поставке.
   * ВАЖНО: путь у этого метода — /api/marketplace/v3/... (не /api/v3/... как у остальных
   * операций с поставками), а id заказа передаётся в теле запроса массивом `orders` (числа),
   * а не в URL — так по актуальной спецификации WB (проверено по реальному 404 от WB API).
   */
  async addOrderToSupply(apiKey: string, supplyId: string, orderId: string): Promise<void> {
    this.logger.log(`addOrderToSupply: заказ ${orderId} → поставка ${supplyId}`);
    await this.request<void>(MARKETPLACE_API_URL, `/api/marketplace/v3/supplies/${supplyId}/orders`, apiKey, {
      method: 'PATCH',
      body: { orders: [Number(orderId)] },
    });
  }

  /** Штрихкод короба поставки, который WB распознаёт при приёмке — то, что реально клеится на короб. */
  async getSupplyBarcode(apiKey: string, supplyId: string, type: 'png' | 'svg' = 'png'): Promise<MarketplaceLabelItem> {
    this.logger.log(`getSupplyBarcode: запрос штрихкода поставки ${supplyId} (${type})`);
    const data = await this.request<{ barcode: string; file: string }>(
      MARKETPLACE_API_URL,
      `/api/v3/supplies/${supplyId}/barcode?type=${type}`,
      apiKey,
    );
    return {
      orderNumber: supplyId,
      contentType: type === 'png' ? 'image/png' : 'image/svg+xml',
      fileBase64: data.file,
    };
  }

  /**
   * Закрывает поставку (готова к передаче в доставку WB) — после этого добавить заказы уже
   * нельзя. Требует, чтобы для поставки заранее был установлен способ отгрузки (см.
   * setShippingMethod) — иначе WB вернёт 409 для продавцов РФ на пункты приёма РФ.
   */
  async deliverSupply(apiKey: string, supplyId: string): Promise<void> {
    this.logger.log(`deliverSupply: закрытие поставки ${supplyId}`);
    await this.request<void>(MARKETPLACE_API_URL, `/api/v3/supplies/${supplyId}/deliver`, apiKey, { method: 'PATCH' });
  }

  /** Список доступных пунктов отгрузки поставок для города — нужен, чтобы выбрать shippingPointId. */
  async getShippingPoints(apiKey: string, city: string, cargoType: 1 | 2 | 3 = 1): Promise<WbShippingPoint[]> {
    this.logger.log(`getShippingPoints: пункты отгрузки для города "${city}" (cargoType=${cargoType})`);
    const data = await this.request<{ shippingPoints: WbShippingPoint[] }>(
      MARKETPLACE_API_URL,
      `/api/marketplace/v3/fbs/shipping-points?city=${encodeURIComponent(city)}&cargoType=${cargoType}`,
      apiKey,
    );
    return data?.shippingPoints ?? [];
  }

  /** Устанавливает способ, дату и пункт отгрузки поставки — обязательно перед deliverSupply. */
  async setShippingMethod(
    apiKey: string,
    params: { supplyId: string; shippingDt: string; shippingPointId: number; shippingType: 'selfShipping' | 'transportCompany' },
  ): Promise<void> {
    this.logger.log(`setShippingMethod: поставка ${params.supplyId} → пункт ${params.shippingPointId} (${params.shippingType})`);
    await this.request<void>(MARKETPLACE_API_URL, '/api/marketplace/v3/fbs/supplies/shipping-method', apiKey, {
      method: 'PATCH',
      body: { data: [params] },
    });
  }

  /** Реальные этикетки заказа (PNG, base64) с WB — то, что клеится на посылку перед отгрузкой. */
  async fetchLabels(
    apiKey: string,
    orderNumbers: string[],
    size: { width: number; height: number } = { width: 58, height: 40 },
  ): Promise<MarketplaceLabelItem[]> {
    this.logger.log(`fetchLabels: запрос этикеток для ${orderNumbers.length} заказов к WB Marketplace API`);
    const orders = orderNumbers.map((n) => Number(n));
    const data = await this.request<{ stickers: { orderId: number; file: string }[] }>(
      MARKETPLACE_API_URL,
      `/api/v3/orders/stickers?type=png&width=${size.width}&height=${size.height}`,
      apiKey,
      { method: 'POST', body: { orders } },
    );
    return (data?.stickers ?? []).map((s) => ({
      orderNumber: String(s.orderId),
      contentType: 'image/png',
      fileBase64: s.file,
    }));
  }
}
