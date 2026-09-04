import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Marketplace } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WildberriesAdapter } from './adapters/wildberries.adapter';
import { OzonAdapter } from './adapters/ozon.adapter';
import { MarketplaceAdapter } from './adapters/marketplace-adapter.interface';

@Injectable()
export class MarketplacesService {
  constructor(
    private prisma: PrismaService,
    private wbAdapter: WildberriesAdapter,
    private ozonAdapter: OzonAdapter,
  ) {}

  private resolveAdapter(marketplace: Marketplace): MarketplaceAdapter {
    if (marketplace === 'WILDBERRIES') return this.wbAdapter;
    if (marketplace === 'OZON') return this.ozonAdapter;
    throw new BadRequestException('Интеграция для этого маркетплейса пока не поддерживается');
  }

  findForClient(clientId: string) {
    return this.prisma.marketplaceIntegration.findMany({ where: { clientId } });
  }

  async upsert(
    clientId: string,
    marketplace: Marketplace,
    data: { apiKey?: string; warehouseId?: string; marketplaceId?: string },
  ) {
    return this.prisma.marketplaceIntegration.upsert({
      where: { clientId_marketplace: { clientId, marketplace } },
      create: { clientId, marketplace, ...data, status: data.apiKey ? 'CONNECTED' : 'NOT_CONNECTED' },
      update: { ...data, status: data.apiKey ? 'CONNECTED' : 'NOT_CONNECTED' },
    });
  }

  async sync(integrationId: string) {
    const integration = await this.prisma.marketplaceIntegration.findUnique({ where: { id: integrationId } });
    if (!integration) throw new NotFoundException('Интеграция не найдена');
    if (!integration.apiKey) throw new BadRequestException('Не указан API-ключ интеграции');

    const adapter = this.resolveAdapter(integration.marketplace);
    try {
      await this.prisma.marketplaceIntegration.update({ where: { id: integrationId }, data: { status: 'SYNCING' } });
      await adapter.fetchOrders(integration.apiKey);
      await adapter.fetchStock(integration.apiKey);
      return this.prisma.marketplaceIntegration.update({
        where: { id: integrationId },
        data: { status: 'CONNECTED', lastSyncAt: new Date() },
      });
    } catch (error) {
      await this.prisma.marketplaceIntegration.update({ where: { id: integrationId }, data: { status: 'ERROR' } });
      throw error;
    }
  }
}
