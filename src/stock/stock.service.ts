import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EventsGateway } from '../events/events.gateway';
import { SettingsService, SETTING_KEYS } from '../settings/settings.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface StockFilters {
  clientId?: string;
  productId?: string;
  article?: string;
  barcode?: string;
  name?: string;
  warehouseId?: string;
  zoneId?: string;
  cellId?: string;
}

export interface AdjustPhysicalInput {
  productId: string;
  clientId: string;
  cellId: string;
  delta: number;
  reason: string;
  reference?: string;
  userId?: string | null;
}

@Injectable()
export class StockService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
    private eventsGateway: EventsGateway,
    private notificationsService: NotificationsService,
    @Optional() private settingsService?: SettingsService,
  ) {}

  async findMany(filters: StockFilters) {
    const rows = await this.prisma.stock.findMany({
      where: {
        ...(filters.clientId && { clientId: filters.clientId }),
        ...(filters.productId && { productId: filters.productId }),
        ...(filters.cellId && { cellId: filters.cellId }),
        cell: {
          ...(filters.zoneId && { zoneId: filters.zoneId }),
          ...(filters.warehouseId && { zone: { warehouseId: filters.warehouseId } }),
        },
        product: {
          ...(filters.article && { article: { contains: filters.article, mode: 'insensitive' } }),
          ...(filters.barcode && { barcode: { contains: filters.barcode } }),
          ...(filters.name && { name: { contains: filters.name, mode: 'insensitive' } }),
        },
      },
      include: {
        product: true,
        client: { select: { id: true, name: true } },
        cell: { include: { zone: { include: { warehouse: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return rows.map((row) => ({
      ...row,
      availableQty: row.physicalQty - row.reservedQty - row.blockedQty,
    }));
  }

  async getTotalsForProduct(productId: string) {
    const rows = await this.prisma.stock.findMany({ where: { productId } });
    const physicalQty = rows.reduce((sum, r) => sum + r.physicalQty, 0);
    const reservedQty = rows.reduce((sum, r) => sum + r.reservedQty, 0);
    const blockedQty = rows.reduce((sum, r) => sum + r.blockedQty, 0);
    return {
      physicalQty,
      reservedQty,
      blockedQty,
      availableQty: physicalQty - reservedQty - blockedQty,
    };
  }

  /** Единственная точка изменения физического остатка — всегда с журналом (см. ТЗ §46, §61). */
  async adjustPhysical(input: AdjustPhysicalInput) {
    return this.prisma.$transaction(async (tx) => {
      const stock = await tx.stock.upsert({
        where: { productId_cellId: { productId: input.productId, cellId: input.cellId } },
        create: {
          productId: input.productId,
          cellId: input.cellId,
          clientId: input.clientId,
          physicalQty: 0,
          reservedQty: 0,
          blockedQty: 0,
        },
        update: {},
      });

      const newQty = stock.physicalQty + input.delta;
      if (newQty < 0) {
        throw new BadRequestException('Недостаточно физического остатка для списания');
      }

      const updated = await tx.stock.update({
        where: { id: stock.id },
        data: { physicalQty: newQty },
      });

      await tx.productHistoryEntry.create({
        data: {
          productId: input.productId,
          delta: input.delta,
          reason: input.reason,
          reference: input.reference,
          userId: input.userId ?? null,
        },
      });

      await this.auditLogService.log({
        userId: input.userId,
        action: 'STOCK_ADJUST',
        entityType: 'Stock',
        entityId: stock.id,
        oldValue: { physicalQty: stock.physicalQty },
        newValue: { physicalQty: newQty },
      });

      this.eventsGateway.emitStockUpdated({ productId: input.productId, clientId: input.clientId });

      return updated;
    });
  }

  /** Резервирует qty товара для клиента, списывая из ячеек с наибольшим доступным остатком. */
  async reserve(params: { productId: string; clientId: string; qty: number; orderId?: string; supplyId?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const stocks = await tx.stock.findMany({
        where: { productId: params.productId, clientId: params.clientId },
        orderBy: { physicalQty: 'desc' },
      });

      const totalAvailable = stocks.reduce(
        (sum, s) => sum + (s.physicalQty - s.reservedQty - s.blockedQty),
        0,
      );
      if (totalAvailable < params.qty) {
        throw new BadRequestException('Недостаточно доступного остатка для резервирования');
      }

      let remaining = params.qty;
      for (const s of stocks) {
        if (remaining <= 0) break;
        const available = s.physicalQty - s.reservedQty - s.blockedQty;
        if (available <= 0) continue;
        const take = Math.min(available, remaining);
        await tx.stock.update({ where: { id: s.id }, data: { reservedQty: { increment: take } } });
        remaining -= take;
      }

      const reservation = await tx.reservation.create({
        data: {
          productId: params.productId,
          clientId: params.clientId,
          qty: params.qty,
          orderId: params.orderId,
          supplyId: params.supplyId,
        },
      });

      this.eventsGateway.emitStockUpdated({ productId: params.productId, clientId: params.clientId });
      return reservation;
    });
  }

  /** Снимает резерв (после отгрузки, отмены заказа или возврата — ТЗ §15). */
  async release(reservationId: string) {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id: reservationId } });
      if (!reservation || reservation.isReleased) return reservation;

      let remaining = reservation.qty;
      const stocks = await tx.stock.findMany({
        where: { productId: reservation.productId, clientId: reservation.clientId, reservedQty: { gt: 0 } },
        orderBy: { reservedQty: 'desc' },
      });
      for (const s of stocks) {
        if (remaining <= 0) break;
        const take = Math.min(s.reservedQty, remaining);
        await tx.stock.update({ where: { id: s.id }, data: { reservedQty: { decrement: take } } });
        remaining -= take;
      }

      const updated = await tx.reservation.update({
        where: { id: reservationId },
        data: { isReleased: true, releasedAt: new Date() },
      });

      this.eventsGateway.emitStockUpdated({ productId: reservation.productId, clientId: reservation.clientId });
      return updated;
    });
  }

  /**
   * Отгрузка: физический остаток и резерв уменьшаются одновременно (ТЗ §60).
   * Резерв всегда снимается полностью (заказ отгружается), а физический остаток
   * никогда не уходит в минус — если после инвентаризации/расхождения товара физически
   * меньше, чем было зарезервировано, разница фиксируется как расхождение и уходит
   * уведомлением, а не тихо портит остаток (ТЗ §61: "нельзя списывать товар без основания").
   */
  async consumeReservation(reservationId: string, userId?: string | null, reference?: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id: reservationId } });
      if (!reservation || reservation.isReleased) return { reservation, shortfall: 0 };

      let remaining = reservation.qty;
      let shortfall = 0;
      const stocks = await tx.stock.findMany({
        where: { productId: reservation.productId, clientId: reservation.clientId, reservedQty: { gt: 0 } },
        orderBy: { reservedQty: 'desc' },
      });
      for (const s of stocks) {
        if (remaining <= 0) break;
        const releaseQty = Math.min(s.reservedQty, remaining);
        const physicalDecrement = Math.min(releaseQty, s.physicalQty);
        shortfall += releaseQty - physicalDecrement;

        await tx.stock.update({
          where: { id: s.id },
          data: { reservedQty: { decrement: releaseQty }, physicalQty: { decrement: physicalDecrement } },
        });
        if (physicalDecrement > 0) {
          await tx.productHistoryEntry.create({
            data: {
              productId: reservation.productId,
              delta: -physicalDecrement,
              reason: 'Отгрузка',
              reference,
              userId: userId ?? null,
            },
          });
        }
        remaining -= releaseQty;
      }

      const updated = await tx.reservation.update({
        where: { id: reservationId },
        data: { isReleased: true, releasedAt: new Date() },
      });

      if (shortfall > 0) {
        await this.auditLogService.log({
          userId,
          action: 'STOCK_SHORTFALL',
          entityType: 'Reservation',
          entityId: reservationId,
          newValue: { productId: reservation.productId, clientId: reservation.clientId, shortfall, reference },
        });
      }

      return { reservation: updated, shortfall };
    });

    if (result.reservation) {
      this.eventsGateway.emitStockUpdated({
        productId: result.reservation.productId,
        clientId: result.reservation.clientId,
      });
    }
    if (result.shortfall > 0 && result.reservation) {
      await this.notificationsService.create({
        clientId: result.reservation.clientId,
        type: 'DISCREPANCY',
        title: 'Расхождение остатка при отгрузке',
        message: `Не хватило ${result.shortfall} шт. физического остатка для полного списания резерва (${reference ?? 'без ссылки'}). Требуется инвентаризация.`,
      });
    }
    return result.reservation;
  }

  /** Перемещение между ячейками одним и тем же товаром/клиентом (ТЗ §17). */
  async transferBetweenCells(params: {
    productId: string;
    clientId: string;
    fromCellId: string;
    toCellId: string;
    qty: number;
    userId?: string | null;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const fromStock = await tx.stock.findUnique({
        where: { productId_cellId: { productId: params.productId, cellId: params.fromCellId } },
      });
      const available = fromStock ? fromStock.physicalQty - fromStock.reservedQty - fromStock.blockedQty : 0;
      if (available < params.qty) {
        throw new BadRequestException('Недостаточно доступного остатка в исходной ячейке');
      }

      await tx.stock.update({
        where: { id: fromStock!.id },
        data: { physicalQty: { decrement: params.qty } },
      });

      await tx.stock.upsert({
        where: { productId_cellId: { productId: params.productId, cellId: params.toCellId } },
        create: {
          productId: params.productId,
          cellId: params.toCellId,
          clientId: params.clientId,
          physicalQty: params.qty,
          reservedQty: 0,
          blockedQty: 0,
        },
        update: { physicalQty: { increment: params.qty } },
      });

      const movement = await tx.movement.create({
        data: {
          productId: params.productId,
          fromCellId: params.fromCellId,
          toCellId: params.toCellId,
          qty: params.qty,
          userId: params.userId ?? null,
        },
      });

      await this.auditLogService.log({
        userId: params.userId,
        action: 'STOCK_MOVE',
        entityType: 'Movement',
        entityId: movement.id,
        newValue: params,
      });

      this.eventsGateway.emitStockUpdated({ productId: params.productId, clientId: params.clientId });
      return movement;
    });
  }

  /** Приоритет буфера: товар → клиент → общий (ТЗ §41). */
  async resolveBufferPercent(productId: string): Promise<number> {
    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id: productId },
      include: { client: true },
    });
    if (product.bufferPercent !== null && product.bufferPercent !== undefined) {
      return Number(product.bufferPercent);
    }
    if (product.client.bufferPercent !== null && product.client.bufferPercent !== undefined) {
      return Number(product.client.bufferPercent);
    }
    const general = await this.settingsService?.get<number>(SETTING_KEYS.GENERAL_BUFFER_PERCENT);
    return general ?? 0;
  }

  async showcaseQtyForProduct(productId: string) {
    const totals = await this.getTotalsForProduct(productId);
    const bufferPercent = await this.resolveBufferPercent(productId);
    const showcaseQty = Math.max(0, Math.floor(totals.availableQty * (1 - bufferPercent / 100)));
    return { ...totals, bufferPercent, showcaseQty };
  }

  async previewBuffer(productId: string, newBufferPercent: number) {
    const totals = await this.getTotalsForProduct(productId);
    const currentBufferPercent = await this.resolveBufferPercent(productId);
    const before = Math.max(0, Math.floor(totals.availableQty * (1 - currentBufferPercent / 100)));
    const after = Math.max(0, Math.floor(totals.availableQty * (1 - newBufferPercent / 100)));
    return { before, after };
  }
}
