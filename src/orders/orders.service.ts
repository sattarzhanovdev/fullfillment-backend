import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FunnelStatus, Marketplace } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';
import { PricingService } from '../pricing/pricing.service';
import { DebtsService } from '../debts/debts.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';
import { isTransitionAllowed } from './order-funnel';

export interface CreateOrderInput {
  orderNumber: string;
  marketplace: Marketplace;
  clientId: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  deadline?: string;
  items: { productId: string; qtyNeeded: number }[];
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private stockService: StockService,
    private pricingService: PricingService,
    private debtsService: DebtsService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) {}

  findAll(filters: { clientId?: string; statuses?: FunnelStatus[]; marketplace?: Marketplace }) {
    return this.prisma.marketplaceOrder.findMany({
      where: {
        ...(filters.clientId && { clientId: filters.clientId }),
        ...(filters.statuses && filters.statuses.length > 0 && { status: { in: filters.statuses } }),
        ...(filters.marketplace && { marketplace: filters.marketplace }),
      },
      include: {
        client: { select: { id: true, name: true } },
        items: { include: { product: true } },
        assignee: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.marketplaceOrder.findUnique({
      where: { id },
      include: {
        client: true,
        items: { include: { product: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        assignee: { select: { id: true, fullName: true } },
        packagingType: true,
      },
    });
    if (!order) throw new NotFoundException('Заказ не найден');
    return order;
  }

  /** Полный цикл создания FBS-заказа: резерв → расчёт цены → статус (ТЗ §48). */
  async create(input: CreateOrderInput) {
    const order = await this.prisma.marketplaceOrder.create({
      data: {
        orderNumber: input.orderNumber,
        marketplace: input.marketplace,
        clientId: input.clientId,
        priority: input.priority ?? 'NORMAL',
        deadline: input.deadline ? new Date(input.deadline) : undefined,
        items: { create: input.items.map((i) => ({ productId: i.productId, qtyNeeded: i.qtyNeeded })) },
      },
      include: { items: true },
    });

    let totalPrice = 0;
    let needsPrice = false;
    let reservationError: string | null = null;

    for (const item of order.items) {
      try {
        await this.stockService.reserve({
          productId: item.productId,
          clientId: input.clientId,
          qty: item.qtyNeeded,
          orderId: order.id,
        });
      } catch {
        reservationError = 'Недостаточно доступного остатка для резервирования';
      }

      const priceResult = await this.pricingService.calculateForProduct(item.productId);
      if (priceResult.price === null) {
        needsPrice = true;
      } else {
        totalPrice += priceResult.price * item.qtyNeeded;
      }
    }

    let nextStatus: FunnelStatus = 'AWAITING_PROCESSING';
    if (reservationError) nextStatus = 'ERROR';
    else if (needsPrice) nextStatus = 'NEEDS_PRICE';
    else {
      const debtSummary = await this.debtsService.getSummary(input.clientId);
      if (debtSummary.state === 'BLOCKED') nextStatus = 'BLOCKED_DEBT';
    }

    await this.transitionStatus(order.id, nextStatus, null, {
      processingCost: needsPrice ? undefined : totalPrice,
    });

    return this.findOne(order.id);
  }

  async transitionStatus(
    orderId: string,
    status: FunnelStatus,
    userId?: string | null,
    extra?: { processingCost?: number },
  ) {
    const order = await this.prisma.marketplaceOrder.findUnique({
      where: { id: orderId },
      include: { reservations: true },
    });
    if (!order) throw new NotFoundException('Заказ не найден');

    if (!isTransitionAllowed(order.status, status)) {
      throw new BadRequestException(`Переход из статуса ${order.status} в ${status} запрещён бизнес-логикой`);
    }

    if (status === 'CANCELLED') {
      for (const r of order.reservations.filter((r) => !r.isReleased)) {
        await this.stockService.release(r.id);
      }
    }

    if (status === 'SHIPPED') {
      for (const r of order.reservations.filter((r) => !r.isReleased)) {
        await this.stockService.consumeReservation(r.id, userId, `FBS заказ №${order.orderNumber}`);
      }
      if (order.processingCost) {
        await this.debtsService.charge(
          order.clientId,
          Number(order.processingCost),
          'Обработка FBS-заказа',
          order.orderNumber,
        );
      }
    }

    const updated = await this.prisma.marketplaceOrder.update({
      where: { id: orderId },
      data: {
        status,
        ...(extra?.processingCost !== undefined && { processingCost: extra.processingCost }),
      },
    });

    await this.prisma.orderStatusHistory.create({
      data: { orderId, status, userId: userId ?? null },
    });

    this.eventsGateway.emitOrderUpdated({ orderId, status });
    return updated;
  }

  assign(orderId: string, assigneeId: string) {
    return this.prisma.marketplaceOrder.update({ where: { id: orderId }, data: { assigneeId } });
  }

  // ---------- Сборка (ТЗ §7) ----------

  async pickableItems(clientId: string) {
    return this.prisma.orderItem.findMany({
      where: {
        order: { clientId, status: { in: ['AWAITING_PROCESSING', 'IN_PROGRESS', 'PICKING'] } },
        notFound: false,
      },
      include: { product: true, order: true },
    });
  }

  async scanPick(orderId: string, barcode: string, userId?: string) {
    const order = await this.prisma.marketplaceOrder.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new NotFoundException('Заказ не найден');

    const item = await this.prisma.orderItem.findFirst({
      where: { orderId, product: { barcode } },
      include: { product: true },
    });
    if (!item) {
      throw new BadRequestException('Неверный товар: штрихкод не соответствует ни одной позиции заказа');
    }
    if (item.qtyPicked >= item.qtyNeeded) {
      throw new BadRequestException('Эта позиция уже полностью собрана');
    }

    const updatedItem = await this.prisma.orderItem.update({
      where: { id: item.id },
      data: { qtyPicked: { increment: 1 } },
    });

    if (order.status === 'AWAITING_PROCESSING' || order.status === 'IN_PROGRESS') {
      await this.transitionStatus(orderId, 'PICKING', userId);
    }

    const allItems = await this.prisma.orderItem.findMany({ where: { orderId } });
    const allPicked = allItems.every((i) => i.qtyPicked >= i.qtyNeeded);
    if (allPicked) {
      await this.transitionStatus(orderId, 'PICKED', userId);
    }

    return { item: updatedItem, allPicked };
  }

  async markItemNotFound(orderId: string, itemId: string, userId?: string) {
    const item = await this.prisma.orderItem.update({ where: { id: itemId }, data: { notFound: true } });
    const order = await this.prisma.marketplaceOrder.findUniqueOrThrow({ where: { id: orderId } });

    await this.notificationsService.create({
      clientId: order.clientId,
      type: 'ITEM_NOT_FOUND',
      title: 'Товар не найден при сборке',
      message: `Заказ №${order.orderNumber}: товар не найден на складе.`,
    });

    await this.transitionStatus(orderId, 'ITEM_NOT_FOUND', userId);
    return item;
  }

  // ---------- Упаковка (ТЗ §8) ----------

  async scanPack(orderId: string, barcode: string, userId?: string) {
    const item = await this.prisma.orderItem.findFirst({
      where: { orderId, product: { barcode } },
    });
    if (!item) {
      throw new BadRequestException('Неверный товар: штрихкод не соответствует ни одной позиции заказа');
    }
    if (item.qtyPacked >= item.qtyPicked) {
      throw new BadRequestException('Эта позиция уже полностью упакована');
    }

    const updatedItem = await this.prisma.orderItem.update({
      where: { id: item.id },
      data: { qtyPacked: { increment: 1 } },
    });

    const order = await this.prisma.marketplaceOrder.findUniqueOrThrow({ where: { id: orderId } });
    if (order.status === 'PICKED') {
      await this.transitionStatus(orderId, 'PACKING', userId);
    }

    const allItems = await this.prisma.orderItem.findMany({ where: { orderId } });
    const allPacked = allItems.every((i) => i.qtyPacked >= i.qtyNeeded);
    if (allPacked) {
      await this.transitionStatus(orderId, 'PACKED', userId);
    }

    return { item: updatedItem, allPacked };
  }

  async setPackaging(orderId: string, packagingTypeId: string) {
    const updated = await this.prisma.marketplaceOrder.update({ where: { id: orderId }, data: { packagingTypeId } });
    if (updated.status === 'PACKED') {
      return this.transitionStatus(orderId, 'READY_TO_SHIP', null);
    }
    return updated;
  }
}
