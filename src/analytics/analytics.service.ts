import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async ordersReport(from: Date, to: Date) {
    const [byStatus, byMarketplace, byClient] = await Promise.all([
      this.prisma.marketplaceOrder.groupBy({
        by: ['status'],
        where: { createdAt: { gte: from, lte: to } },
        _count: true,
      }),
      this.prisma.marketplaceOrder.groupBy({
        by: ['marketplace'],
        where: { createdAt: { gte: from, lte: to } },
        _count: true,
      }),
      this.prisma.marketplaceOrder.groupBy({
        by: ['clientId'],
        where: { createdAt: { gte: from, lte: to } },
        _count: true,
      }),
    ]);
    return { byStatus, byMarketplace, byClient };
  }

  /** Динамика заказов и выручки по дням — для графиков (§53). */
  async timeSeries(from: Date, to: Date, clientId?: string) {
    const [orders, debtEntries] = await Promise.all([
      this.prisma.marketplaceOrder.findMany({
        where: { createdAt: { gte: from, lte: to }, ...(clientId && { clientId }) },
        select: { createdAt: true },
      }),
      this.prisma.debtLedgerEntry.findMany({
        where: { createdAt: { gte: from, lte: to }, amount: { gt: 0 }, ...(clientId && { clientId }) },
        select: { createdAt: true, amount: true },
      }),
    ]);

    const dayKey = (d: Date) => d.toISOString().slice(0, 10);
    const days: string[] = [];
    const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
    const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));
    while (cursor <= end) {
      days.push(dayKey(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    const ordersByDay = new Map(days.map((d) => [d, 0]));
    for (const o of orders) {
      const k = dayKey(o.createdAt);
      if (ordersByDay.has(k)) ordersByDay.set(k, (ordersByDay.get(k) ?? 0) + 1);
    }

    const revenueByDay = new Map(days.map((d) => [d, 0]));
    for (const e of debtEntries) {
      const k = dayKey(e.createdAt);
      if (revenueByDay.has(k)) revenueByDay.set(k, (revenueByDay.get(k) ?? 0) + Number(e.amount));
    }

    return days.map((d) => ({
      date: d,
      orders: ordersByDay.get(d) ?? 0,
      revenue: Number((revenueByDay.get(d) ?? 0).toFixed(2)),
    }));
  }

  /** Топ товаров по количеству в заказах за период (§53). */
  async topProducts(from: Date, to: Date, limit = 10, clientId?: string) {
    const items = await this.prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: from, lte: to }, ...(clientId && { clientId }) } },
      select: { qtyNeeded: true, product: { select: { id: true, name: true, article: true } } },
    });

    const map = new Map<string, { productId: string; name: string; article: string; qty: number }>();
    for (const item of items) {
      const existing = map.get(item.product.id) ?? {
        productId: item.product.id,
        name: item.product.name,
        article: item.product.article,
        qty: 0,
      };
      existing.qty += item.qtyNeeded;
      map.set(item.product.id, existing);
    }

    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, limit);
  }

  /** Топ клиентов по обороту за период (§53). */
  async topClients(from: Date, to: Date, limit = 10) {
    const grouped = await this.prisma.debtLedgerEntry.groupBy({
      by: ['clientId'],
      where: { createdAt: { gte: from, lte: to }, amount: { gt: 0 } },
      _sum: { amount: true },
    });

    const sorted = grouped
      .map((g) => ({ clientId: g.clientId, revenue: Number(g._sum.amount ?? 0) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    const clients = await this.prisma.client.findMany({ where: { id: { in: sorted.map((s) => s.clientId) } } });
    const clientMap = new Map(clients.map((c) => [c.id, c.name]));

    return sorted.map((s) => ({ ...s, name: clientMap.get(s.clientId) ?? '—' }));
  }

  /** Сравнение текущего периода с предыдущим периодом такой же длины (§53). */
  async periodComparison(from: Date, to: Date) {
    const lengthMs = to.getTime() - from.getTime();
    const prevTo = new Date(from.getTime() - 1);
    const prevFrom = new Date(prevTo.getTime() - lengthMs);

    const [currentFinance, previousFinance, currentOrders, previousOrders] = await Promise.all([
      this.financeReport(from, to),
      this.financeReport(prevFrom, prevTo),
      this.prisma.marketplaceOrder.count({ where: { createdAt: { gte: from, lte: to } } }),
      this.prisma.marketplaceOrder.count({ where: { createdAt: { gte: prevFrom, lte: prevTo } } }),
    ]);

    const pctChange = (curr: number, prev: number) => (prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100);

    return {
      current: { from, to, revenue: currentFinance.charged, orders: currentOrders },
      previous: { from: prevFrom, to: prevTo, revenue: previousFinance.charged, orders: previousOrders },
      change: {
        revenuePct: Number(pctChange(currentFinance.charged, previousFinance.charged).toFixed(1)),
        ordersPct: Number(pctChange(currentOrders, previousOrders).toFixed(1)),
      },
    };
  }

  async warehouseReport() {
    const stocks = await this.prisma.stock.findMany({ include: { product: true } });
    const totalPhysical = stocks.reduce((s, r) => s + r.physicalQty, 0);
    const totalReserved = stocks.reduce((s, r) => s + r.reservedQty, 0);
    const lowStock = stocks.filter((s) => s.physicalQty - s.reservedQty <= 5 && s.physicalQty - s.reservedQty >= 0);
    const staleThreshold = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const staleProducts = await this.prisma.product.findMany({
      where: { updatedAt: { lt: staleThreshold }, isActive: true },
      take: 50,
    });
    return {
      totalPhysical,
      totalReserved,
      totalAvailable: totalPhysical - totalReserved,
      lowStockCount: lowStock.length,
      staleProductsCount: staleProducts.length,
    };
  }

  async financeReport(from: Date, to: Date) {
    const [charged, paid, currentDebt] = await Promise.all([
      this.prisma.debtLedgerEntry.aggregate({
        where: { amount: { gt: 0 }, createdAt: { gte: from, lte: to } },
        _sum: { amount: true },
      }),
      this.prisma.debtLedgerEntry.aggregate({
        where: { amount: { lt: 0 }, createdAt: { gte: from, lte: to } },
        _sum: { amount: true },
      }),
      this.prisma.debtLedgerEntry.aggregate({ _sum: { amount: true } }),
    ]);
    return {
      charged: Number(charged._sum.amount ?? 0),
      paid: Math.abs(Number(paid._sum.amount ?? 0)),
      currentDebt: Number(currentDebt._sum.amount ?? 0),
    };
  }

  async operationalEfficiency(from: Date, to: Date) {
    const history = await this.prisma.orderStatusHistory.findMany({
      where: { createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: 'asc' },
    });

    const byOrder = new Map<string, typeof history>();
    for (const h of history) {
      const arr = byOrder.get(h.orderId) ?? [];
      arr.push(h);
      byOrder.set(h.orderId, arr);
    }

    const durations = { pickingMs: [] as number[], packingMs: [] as number[], orderToShipMs: [] as number[] };
    for (const events of byOrder.values()) {
      const find = (s: string) => events.find((e) => e.status === s)?.createdAt;
      const picking = find('PICKING');
      const picked = find('PICKED');
      const packing = find('PACKING');
      const packed = find('PACKED');
      const created = events[0]?.createdAt;
      const shipped = find('SHIPPED');
      if (picking && picked) durations.pickingMs.push(picked.getTime() - picking.getTime());
      if (packing && packed) durations.packingMs.push(packed.getTime() - packing.getTime());
      if (created && shipped) durations.orderToShipMs.push(shipped.getTime() - created.getTime());
    }

    const avg = (arr: number[]) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null);

    const notFoundCount = await this.prisma.orderItem.count({ where: { notFound: true } });
    const totalItems = await this.prisma.orderItem.count();

    return {
      avgPickingMs: avg(durations.pickingMs),
      avgPackingMs: avg(durations.packingMs),
      avgOrderToShipMs: avg(durations.orderToShipMs),
      itemNotFoundRatio: totalItems ? notFoundCount / totalItems : 0,
    };
  }

  async employeeKpi(from: Date, to: Date) {
    const pickEvents = await this.prisma.orderStatusHistory.findMany({
      where: { status: 'PICKED', createdAt: { gte: from, lte: to }, userId: { not: null } },
    });
    const packEvents = await this.prisma.orderStatusHistory.findMany({
      where: { status: 'PACKED', createdAt: { gte: from, lte: to }, userId: { not: null } },
    });
    const receiptEvents = await this.prisma.receipt.findMany({
      where: { createdAt: { gte: from, lte: to }, createdById: { not: null } },
    });

    const countBy = <T extends { userId?: string | null; createdById?: string | null }>(items: T[], key: 'userId' | 'createdById') => {
      const map = new Map<string, number>();
      for (const item of items) {
        const id = item[key];
        if (!id) continue;
        map.set(id, (map.get(id) ?? 0) + 1);
      }
      return Object.fromEntries(map);
    };

    return {
      ordersPickedByUser: countBy(pickEvents, 'userId'),
      ordersPackedByUser: countBy(packEvents, 'userId'),
      receiptsByUser: countBy(receiptEvents, 'createdById'),
    };
  }
}
