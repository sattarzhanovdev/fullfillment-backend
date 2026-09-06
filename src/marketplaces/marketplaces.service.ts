import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Marketplace } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WildberriesAdapter } from './adapters/wildberries.adapter';
import { OzonAdapter } from './adapters/ozon.adapter';
import { MarketplaceAdapter, MarketplaceProductCatalogItem } from './adapters/marketplace-adapter.interface';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class MarketplacesService {
  private readonly logger = new Logger(MarketplacesService.name);

  constructor(
    private prisma: PrismaService,
    private wbAdapter: WildberriesAdapter,
    private ozonAdapter: OzonAdapter,
    private ordersService: OrdersService,
    private productsService: ProductsService,
  ) {}

  private resolveAdapter(marketplace: Marketplace): MarketplaceAdapter {
    if (marketplace === 'WILDBERRIES') return this.wbAdapter;
    if (marketplace === 'OZON') return this.ozonAdapter;
    throw new BadRequestException('Интеграция для этого маркетплейса пока не поддерживается');
  }

  /** Ключ интеграции — секрет клиента, наружу отдаём только признак "сохранён", не значение. */
  private maskApiKey<T extends { apiKey: string | null }>(integration: T): T {
    return { ...integration, apiKey: integration.apiKey ? '••••••••' : null };
  }

  async findForClient(clientId: string) {
    const integrations = await this.prisma.marketplaceIntegration.findMany({ where: { clientId } });
    return integrations.map((i) => this.maskApiKey(i));
  }

  async upsert(
    clientId: string,
    marketplace: Marketplace,
    data: { apiKey?: string; warehouseId?: string; marketplaceId?: string },
  ) {
    const integration = await this.prisma.marketplaceIntegration.upsert({
      where: { clientId_marketplace: { clientId, marketplace } },
      create: { clientId, marketplace, ...data, status: data.apiKey ? 'CONNECTED' : 'NOT_CONNECTED' },
      update: { ...data, status: data.apiKey ? 'CONNECTED' : 'NOT_CONNECTED' },
    });
    return this.maskApiKey(integration);
  }

  async sync(integrationId: string) {
    const integration = await this.prisma.marketplaceIntegration.findUnique({ where: { id: integrationId } });
    if (!integration) throw new NotFoundException('Интеграция не найдена');
    if (!integration.apiKey) throw new BadRequestException('Не указан API-ключ интеграции');

    const adapter = this.resolveAdapter(integration.marketplace);
    try {
      await this.prisma.marketplaceIntegration.update({ where: { id: integrationId }, data: { status: 'SYNCING' } });

      // Каталог — необязательное обогащение (нужен доступ категории "Контент",
      // которого у ключа может не быть). Если недоступен — не валим весь синк,
      // importOrders всё равно заведёт черновые карточки по данным заказа.
      let catalogResult = { catalogFetched: 0, catalogCreated: 0, catalogUpdated: 0, catalogError: null as string | null };
      try {
        const catalog = await adapter.fetchProductCatalog(integration.apiKey);
        catalogResult = { ...(await this.importCatalog(integration.clientId, catalog)), catalogError: null };
      } catch (catalogError) {
        const message = catalogError instanceof Error ? catalogError.message : String(catalogError);
        this.logger.warn(`sync: каталог маркетплейса недоступен, пропускаем обогащение — ${message}`);
        catalogResult.catalogError = message;
      }

      const fetchedOrders = await adapter.fetchOrders(integration.apiKey);
      const importResult = await this.importOrders(integration.clientId, integration.marketplace, fetchedOrders);

      await adapter.fetchStock(integration.apiKey);

      await this.prisma.marketplaceIntegration.update({
        where: { id: integrationId },
        data: { status: 'CONNECTED', lastSyncAt: new Date() },
      });
      return { integrationId, ...catalogResult, ...importResult };
    } catch (error) {
      await this.prisma.marketplaceIntegration.update({ where: { id: integrationId }, data: { status: 'ERROR' } });
      throw error;
    }
  }

  /**
   * Затягивает весь каталог карточек товара с маркетплейса (название,
   * габариты, вес) и заводит/обновляет Product по штрихкоду — чтобы реальные
   * заказы матчились с полноценными карточками, а не с черновиками "название
   * неизвестно". Один WB-товар может иметь несколько размеров/штрихкодов —
   * на каждый штрихкод отдельная запись Product, как того требует модель.
   */
  private async importCatalog(clientId: string, catalog: MarketplaceProductCatalogItem[]) {
    let catalogCreated = 0;
    let catalogUpdated = 0;

    for (const item of catalog) {
      const existing = await this.productsService.findByBarcode(item.barcode, clientId);
      const fields = {
        name: item.name,
        article: item.article,
        lengthCm: item.lengthCm,
        widthCm: item.widthCm,
        heightCm: item.heightCm,
        weightKg: item.weightKg,
      };

      if (existing) {
        await this.productsService.update(existing.id, fields);
        catalogUpdated++;
        continue;
      }

      try {
        await this.productsService.create({ clientId, sku: item.article, barcode: item.barcode, ...fields });
      } catch {
        // Артикул уже занят другим штрихкодом той же карточки (несколько размеров) — уникализируем.
        await this.productsService.create({
          clientId,
          sku: `${item.article}-${item.barcode}`,
          barcode: item.barcode,
          ...fields,
          article: `${item.article}-${item.barcode}`,
        });
      }
      catalogCreated++;
    }

    return { catalogFetched: catalog.length, catalogCreated, catalogUpdated };
  }

  /**
   * Создаёт реальные FBS-заказы (MarketplaceOrder) из данных маркетплейса
   * через штатный OrdersService.create — резерв остатков, ценообразование,
   * проверка задолженности, статусная машина (ТЗ §48) отрабатывают как для
   * заказа, заведённого вручную. importCatalog уже должен был завести карточку
   * для каждого реального штрихкода; черновик здесь — крайний случай (штрихкод
   * пропал из свежего среза каталога, но остался в заказе), и это тревожный
   * сигнал, а не штатный путь.
   */
  private async importOrders(
    clientId: string,
    marketplace: Marketplace,
    fetchedOrders: { externalOrderNumber: string; productBarcode: string; qty: number; productArticle?: string }[],
  ) {
    let created = 0;
    let skippedExisting = 0;
    let autoCreatedProducts = 0;

    for (const fetched of fetchedOrders) {
      const existingOrder = await this.prisma.marketplaceOrder.findUnique({ where: { orderNumber: fetched.externalOrderNumber } });
      if (existingOrder) {
        skippedExisting++;
        continue;
      }

      let product = await this.productsService.findByBarcode(fetched.productBarcode, clientId);
      if (!product) {
        const article = fetched.productArticle || fetched.productBarcode;
        product = await this.productsService.create({
          clientId,
          name: `Товар WB (арт. ${article})`,
          sku: article,
          article,
          barcode: fetched.productBarcode,
        });
        autoCreatedProducts++;
        this.logger.warn(
          `sync: штрихкод ${fetched.productBarcode} (арт. ${article}) отсутствует в актуальном каталоге маркетплейса, заведена черновая карточка — требуются габариты/цена`,
        );
      }

      await this.ordersService.create({
        orderNumber: fetched.externalOrderNumber,
        marketplace,
        clientId,
        items: [{ productId: product.id, qtyNeeded: fetched.qty }],
      });
      created++;
    }

    return { ordersFetched: fetchedOrders.length, ordersCreated: created, ordersSkippedExisting: skippedExisting, autoCreatedProducts };
  }
}
