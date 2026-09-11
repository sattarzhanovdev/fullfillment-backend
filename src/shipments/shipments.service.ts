import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Marketplace, ShipmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WbShippingPoint, WildberriesAdapter } from '../marketplaces/adapters/wildberries.adapter';
import { MarketplaceLabelItem } from '../marketplaces/adapters/marketplace-adapter.interface';

@Injectable()
export class ShipmentsService {
  private readonly logger = new Logger(ShipmentsService.name);

  constructor(
    private prisma: PrismaService,
    private wbAdapter: WildberriesAdapter,
  ) {}

  findAll(filters: { statuses?: ShipmentStatus[]; from?: string; to?: string }) {
    return this.prisma.shipment.findMany({
      where: {
        ...(filters.statuses && filters.statuses.length > 0 && { status: { in: filters.statuses } }),
        ...(filters.from && filters.to && { scheduledAt: { gte: new Date(filters.from), lte: new Date(filters.to) } }),
      },
      include: {
        warehouse: true,
        orders: { include: { client: { select: { id: true, name: true } } } },
        supplies: { include: { client: { select: { id: true, name: true } } } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        warehouse: true,
        orders: { include: { client: true, items: { include: { product: true } } } },
        supplies: { include: { client: true, items: { include: { product: true } } } },
      },
    });
    if (!shipment) throw new NotFoundException('Отгрузка не найдена');
    return shipment;
  }

  async findByBarcode(barcode: string) {
    const shipment = await this.prisma.shipment.findUnique({ where: { barcode } });
    if (!shipment) throw new NotFoundException('Отгрузка с таким штрихкодом не найдена');
    return this.findOne(shipment.id);
  }

  async create(data: {
    marketplace?: Marketplace;
    warehouseId?: string;
    scheduledAt: string;
    transport?: string;
    driverName?: string;
  }) {
    const barcode = await this.generateBarcode();
    return this.prisma.shipment.create({
      data: { ...data, barcode, scheduledAt: new Date(data.scheduledAt) },
    });
  }

  /** Уникальный числовой штрихкод короба отгрузки (ТЗ: скан короба выбирает отгрузку). */
  private async generateBarcode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
      const exists = await this.prisma.shipment.findUnique({ where: { barcode: candidate } });
      if (!exists) return candidate;
    }
    throw new Error('Не удалось сгенерировать уникальный штрихкод отгрузки');
  }

  async update(id: string, data: { transport?: string; driverName?: string; status?: ShipmentStatus; scheduledAt?: string }) {
    const updated = await this.prisma.shipment.update({
      where: { id },
      data: { ...data, ...(data.scheduledAt && { scheduledAt: new Date(data.scheduledAt) }) },
    });

    // Заказ уехал со склада — закрываем поставку в WB (после этого WB не даст добавлять заказы).
    // Документация WB требует предварительно указать пункт отгрузки для продавцов РФ, но на
    // практике для части аккаунтов deliver проходит и без этого — поэтому не блокируем вызов
    // сами, а просто пробуем и логируем то, что реально ответил WB.
    if (data.status === 'SHIPPED' && updated.wbSupplyId && updated.clientId) {
      const apiKey = await this.findWbApiKey(updated.clientId);
      if (apiKey) {
        try {
          await this.wbAdapter.deliverSupply(apiKey, updated.wbSupplyId);
        } catch (err) {
          this.logger.warn(`deliverSupply(${updated.wbSupplyId}) не удался: ${(err as Error).message}`);
        }
      }
    }

    return updated;
  }

  /** Пункты отгрузки WB для города — чтобы выбрать shippingPointId перед закрытием поставки. */
  async getShippingPoints(shipmentId: string, city: string, cargoType: 1 | 2 | 3 = 1): Promise<WbShippingPoint[]> {
    const shipment = await this.prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) throw new NotFoundException('Отгрузка не найдена');
    if (!shipment.clientId) throw new BadRequestException('В отгрузке ещё нет заказов — сначала добавьте хотя бы один');
    const apiKey = await this.findWbApiKey(shipment.clientId);
    if (!apiKey) throw new BadRequestException('У клиента этой отгрузки не подключён WB API');
    try {
      return await this.wbAdapter.getShippingPoints(apiKey, city, cargoType);
    } catch (err) {
      this.logger.warn(`getShippingPoints(${shipmentId}) не удался: ${(err as Error).message}`);
      throw new BadRequestException((err as Error).message);
    }
  }

  /** Устанавливает способ и пункт отгрузки — обязательно перед закрытием поставки (deliver). */
  async setShippingMethod(shipmentId: string, shippingPointId: number, shippingType: 'selfShipping' | 'transportCompany') {
    const shipment = await this.prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) throw new NotFoundException('Отгрузка не найдена');
    if (!shipment.wbSupplyId || !shipment.clientId) {
      throw new BadRequestException('Для этой отгрузки ещё нет поставки WB — добавьте хотя бы один заказ клиента с подключённым WB API');
    }
    const apiKey = await this.findWbApiKey(shipment.clientId);
    if (!apiKey) throw new BadRequestException('У клиента этой отгрузки не подключён WB API');

    try {
      await this.wbAdapter.setShippingMethod(apiKey, {
        supplyId: shipment.wbSupplyId,
        shippingDt: shipment.scheduledAt.toISOString().slice(0, 10),
        shippingPointId,
        shippingType,
      });
    } catch (err) {
      this.logger.warn(`setShippingMethod(${shipmentId}) не удался: ${(err as Error).message}`);
      throw new BadRequestException((err as Error).message);
    }

    return this.prisma.shipment.update({ where: { id: shipmentId }, data: { wbShippingPointId: shippingPointId, wbShippingType: shippingType } });
  }

  async addOrder(shipmentId: string, orderId: string) {
    const [shipment, order] = await Promise.all([
      this.prisma.shipment.findUnique({ where: { id: shipmentId } }),
      this.prisma.marketplaceOrder.findUnique({ where: { id: orderId } }),
    ]);
    if (!shipment) throw new NotFoundException('Отгрузка не найдена');
    if (!order) throw new NotFoundException('Заказ не найден');
    if (shipment.status !== 'PLANNED' && shipment.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Эта отгрузка уже закрыта (отгружена/завершена/отменена) — добавлять в неё заказы нельзя');
    }
    if (order.shipmentId === shipmentId) {
      // Уже в этой отгрузке — не дёргаем WB повторно (поставка может быть уже закрыта у WB).
      return { ...(await this.findOne(shipmentId)), wbWarning: null };
    }
    if (shipment.clientId && shipment.clientId !== order.clientId) {
      throw new BadRequestException(
        'В этой отгрузке уже есть заказы другого клиента — поставка WB привязана к одному продавцу, создайте отдельную отгрузку',
      );
    }

    await this.prisma.marketplaceOrder.update({ where: { id: orderId }, data: { shipmentId } });
    if (!shipment.clientId) {
      await this.prisma.shipment.update({
        where: { id: shipmentId },
        data: { clientId: order.clientId, marketplace: shipment.marketplace ?? order.marketplace },
      });
    }

    let wbWarning: string | null = null;
    try {
      await this.syncOrderToWb(shipmentId, order.clientId, order.orderNumber);
    } catch (err) {
      wbWarning = (err as Error).message;
      this.logger.warn(`syncOrderToWb(${shipmentId}, ${order.orderNumber}) не удался: ${wbWarning}`);
    }

    const updated = await this.recalculateTotals(shipmentId);
    return { ...updated, wbWarning };
  }

  /**
   * Вызывается при скане товара на сборке — чтобы получить стикер WB как можно раньше,
   * заказ сразу подключается к (найденной или созданной) открытой отгрузке клиента, что
   * запускает подтверждение заказа в WB (supplierStatus new → confirm). Если заказ уже
   * привязан к какой-то отгрузке — ничего не делает (уже подключён).
   */
  async ensureOrderInShipment(orderId: string): Promise<{ shipmentId: string; wbWarning: string | null }> {
    const order = await this.prisma.marketplaceOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Заказ не найден');
    if (order.shipmentId) return { shipmentId: order.shipmentId, wbWarning: null };

    let shipment = await this.prisma.shipment.findFirst({
      where: { clientId: order.clientId, status: { in: ['PLANNED', 'IN_PROGRESS'] } },
      orderBy: { createdAt: 'desc' },
    });
    if (!shipment) {
      const barcode = await this.generateBarcode();
      shipment = await this.prisma.shipment.create({
        data: { barcode, clientId: order.clientId, marketplace: order.marketplace, scheduledAt: new Date() },
      });
    }

    const result = await this.addOrder(shipment.id, orderId);
    return { shipmentId: shipment.id, wbWarning: result.wbWarning };
  }

  async addSupply(shipmentId: string, supplyId: string) {
    const [shipment, supply] = await Promise.all([
      this.prisma.shipment.findUnique({ where: { id: shipmentId } }),
      this.prisma.supply.findUnique({ where: { id: supplyId } }),
    ]);
    if (!shipment) throw new NotFoundException('Отгрузка не найдена');
    if (!supply) throw new NotFoundException('Поставка не найдена');
    if (shipment.status !== 'PLANNED' && shipment.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Эта отгрузка уже закрыта (отгружена/завершена/отменена) — добавлять в неё поставки нельзя');
    }
    if (shipment.clientId && shipment.clientId !== supply.clientId) {
      throw new BadRequestException('В этой отгрузке уже есть заказы другого клиента — создайте отдельную отгрузку');
    }

    await this.prisma.supply.update({ where: { id: supplyId }, data: { shipmentId } });
    if (!shipment.clientId) {
      await this.prisma.shipment.update({ where: { id: shipmentId }, data: { clientId: supply.clientId } });
    }
    return this.recalculateTotals(shipmentId);
  }

  private async findWbApiKey(clientId: string): Promise<string | null> {
    const integration = await this.prisma.marketplaceIntegration.findUnique({
      where: { clientId_marketplace: { clientId, marketplace: 'WILDBERRIES' } },
    });
    return integration?.apiKey ?? null;
  }

  /**
   * Синхронизирует заказ с реальной поставкой WB (если у клиента подключён WB API): создаёт
   * поставку в WB при первом заказе, затем присоединяет заказ по его настоящему id WB.
   * Не подключён API — тихо ничего не делает (это не ошибка, просто локальная отгрузка).
   */
  private async syncOrderToWb(shipmentId: string, clientId: string, orderNumber: string): Promise<void> {
    const shipment = await this.prisma.shipment.findUniqueOrThrow({ where: { id: shipmentId } });
    if (shipment.marketplace && shipment.marketplace !== 'WILDBERRIES') return;

    const apiKey = await this.findWbApiKey(clientId);
    if (!apiKey) return;

    let wbSupplyId = shipment.wbSupplyId;
    if (!wbSupplyId) {
      const created = await this.wbAdapter.createSupply(apiKey, `Отгрузка ${shipment.scheduledAt.toISOString().slice(0, 10)}`);
      wbSupplyId = created.id;
      await this.prisma.shipment.update({ where: { id: shipmentId }, data: { wbSupplyId } });
    }

    await this.wbAdapter.addOrderToSupply(apiKey, wbSupplyId, orderNumber);
  }

  /** Реальный штрихкод короба из WB (для печати) — если у клиента отгрузки подключён WB API. */
  async getWbBarcode(shipmentId: string): Promise<MarketplaceLabelItem> {
    const shipment = await this.prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) throw new NotFoundException('Отгрузка не найдена');
    if (!shipment.wbSupplyId || !shipment.clientId) {
      throw new NotFoundException('Для этой отгрузки нет штрихкода WB — либо у клиента не подключён WB API, либо в отгрузке ещё нет заказов');
    }
    const apiKey = await this.findWbApiKey(shipment.clientId);
    if (!apiKey) throw new NotFoundException('Интеграция с WB для клиента этой отгрузки отсутствует');
    try {
      return await this.wbAdapter.getSupplyBarcode(apiKey, shipment.wbSupplyId);
    } catch (err) {
      this.logger.warn(`getSupplyBarcode(${shipment.wbSupplyId}) не удался: ${(err as Error).message}`);
      throw new BadRequestException((err as Error).message);
    }
  }

  async recalculateTotals(shipmentId: string) {
    const shipment = await this.findOne(shipmentId);
    let totalWeightKg = 0;
    let totalVolumeL = 0;
    let boxesCount = 0;

    for (const order of shipment.orders) {
      for (const item of order.items) {
        const w = item.product.weightKg ? Number(item.product.weightKg) : 0;
        const l = item.product.lengthCm ? Number(item.product.lengthCm) : 0;
        const wi = item.product.widthCm ? Number(item.product.widthCm) : 0;
        const h = item.product.heightCm ? Number(item.product.heightCm) : 0;
        totalWeightKg += w * item.qtyNeeded;
        totalVolumeL += ((l * wi * h) / 1000) * item.qtyNeeded;
      }
    }
    for (const supply of shipment.supplies) {
      boxesCount += supply.boxesCount ?? 0;
      for (const item of supply.items) {
        const w = item.product.weightKg ? Number(item.product.weightKg) : 0;
        totalWeightKg += w * item.qtyNeeded;
      }
    }

    return this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        totalWeightKg: Number(totalWeightKg.toFixed(2)),
        totalVolumeL: Number(totalVolumeL.toFixed(2)),
        boxesCount,
      },
    });
  }
}
