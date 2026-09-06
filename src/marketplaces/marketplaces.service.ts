import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Marketplace } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WildberriesAdapter } from './adapters/wildberries.adapter';
import { OzonAdapter } from './adapters/ozon.adapter';
import { MarketplaceAdapter } from './adapters/marketplace-adapter.interface';
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

      const fetchedOrders = await adapter.fetchOrders(integration.apiKey);
      const importResult = await this.importOrders(integration.clientId, integration.marketplace, fetchedOrders);

      await adapter.fetchStock(integration.apiKey);

      await this.prisma.marketplaceIntegration.update({
        where: { id: integrationId },
        data: { status: 'CONNECTED', lastSyncAt: new Date() },
      });
      return { integrationId, ...importResult };
    } catch (error) {
      await this.prisma.marketplaceIntegration.update({ where: { id: integrationId }, data: { status: 'ERROR' } });
      throw error;
    }
  }

  /**
   * Создаёт реальные FBS-заказы (MarketplaceOrder) из данных маркетплейса
   * через штатный OrdersService.create — резерв остатков, ценообразование,
   * проверка задолженности, статусная машина (ТЗ §48) отрабатывают как для
   * заказа, заведённого вручную. Если штрихкод не найден в каталоге клиента,
   * заводим черновую карточку товара (без остатков/габаритов/цены) — заказ
   * штатно уйдёт в ERROR (нет остатка для резерва) или NEEDS_PRICE, пока
   * кто-то не заведёт остатки и не заполнит габариты/цену.
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
        this.logger.warn(`sync: заведена черновая карточка товара для штрихкода ${fetched.productBarcode} (арт. ${article}) — требуются габариты/цена`);
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
