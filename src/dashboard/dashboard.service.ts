import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private analyticsService: AnalyticsService,
  ) {}

  async getSummary() {
    const today = startOfDay();
    const monthStart = startOfMonth();

    const [
      totalClients,
      activeClients,
      totalProducts,
      stockAgg,
      ordersToday,
      ordersPicking,
      ordersPacked,
      ordersAwaitingShipment,
      shippedToday,
      fbsOrdersCount,
      fboSuppliesCount,
      revenueDay,
      revenueMonth,
      debtsAgg,
      blockedDebtOrders,
      needsPriceOrders,
      productsWithoutDimensions,
    ] = await Promise.all([
      this.prisma.client.count(),
      this.prisma.client.count({ where: { status: 'ACTIVE' } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.stock.aggregate({ _sum: { physicalQty: true } }),
      this.prisma.marketplaceOrder.count({ where: { createdAt: { gte: today } } }),
      this.prisma.marketplaceOrder.count({ where: { status: 'PICKING' } }),
      this.prisma.marketplaceOrder.count({ where: { status: 'PACKED' } }),
      this.prisma.marketplaceOrder.count({ where: { status: 'READY_TO_SHIP' } }),
      this.prisma.orderStatusHistory.count({ where: { status: 'SHIPPED', createdAt: { gte: today } } }),
      this.prisma.marketplaceOrder.count(),
      this.prisma.supply.count(),
      this.prisma.debtLedgerEntry.aggregate({
        where: { amount: { gt: 0 }, createdAt: { gte: today } },
        _sum: { amount: true },
      }),
      this.prisma.debtLedgerEntry.aggregate({
        where: { amount: { gt: 0 }, createdAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      this.prisma.debtLedgerEntry.groupBy({ by: ['clientId'], _sum: { amount: true } }),
      this.prisma.marketplaceOrder.count({ where: { status: 'BLOCKED_DEBT' } }),
      this.prisma.marketplaceOrder.count({ where: { status: 'NEEDS_PRICE' } }),
      this.prisma.product.count({
        where: { isActive: true, OR: [{ lengthCm: null }, { widthCm: null }, { heightCm: null }] },
      }),
    ]);

    const totalDebt = debtsAgg.reduce((sum, d) => sum + Number(d._sum.amount ?? 0), 0);

    const stocks = await this.prisma.stock.findMany({ select: { productId: true, physicalQty: true, reservedQty: true } });
    const byProduct = new Map<string, number>();
    for (const s of stocks) byProduct.set(s.productId, (byProduct.get(s.productId) ?? 0) + s.physicalQty - s.reservedQty);
    const criticalStockCount = Array.from(byProduct.values()).filter((qty) => qty <= 5).length;

    return {
      totalClients,
      activeClients,
      totalProducts,
      totalStockUnits: stockAgg._sum.physicalQty ?? 0,
      ordersToday,
      ordersPicking,
      ordersPacked,
      ordersAwaitingShipment,
      shippedToday,
      fbsOrdersCount,
      fboSuppliesCount,
      revenueDay: Number(revenueDay._sum.amount ?? 0),
      revenueMonth: Number(revenueMonth._sum.amount ?? 0),
      totalDebt,
      blockedDebtOrders,
      needsPriceOrders,
      productsWithoutDimensions,
      criticalStockCount,
    };
  }

  /** Динамика заказов/выручки за последние N дней — для мини-графика на главной. */
  async getTrend(days = 14) {
    const to = new Date();
    const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    return this.analyticsService.timeSeries(from, to);
  }

  /** Заказы, требующие внимания оператора (§35, §38, §7). */
  async getAttentionOrders(take = 8) {
    return this.prisma.marketplaceOrder.findMany({
      where: { status: { in: ['NEEDS_PRICE', 'BLOCKED_DEBT', 'ITEM_NOT_FOUND', 'ERROR', 'NEEDS_CLARIFICATION'] } },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { updatedAt: 'desc' },
      take,
    });
  }

  /** Товары с критическим остатком (доступно ≤ 5 шт). */
  async getLowStockProducts(take = 8) {
    const stocks = await this.prisma.stock.findMany({
      select: { productId: true, physicalQty: true, reservedQty: true },
    });
    const byProduct = new Map<string, number>();
    for (const s of stocks) {
      byProduct.set(s.productId, (byProduct.get(s.productId) ?? 0) + s.physicalQty - s.reservedQty);
    }
    const lowIds = Array.from(byProduct.entries())
      .filter(([, qty]) => qty <= 5)
      .sort((a, b) => a[1] - b[1])
      .slice(0, take);

    const products = await this.prisma.product.findMany({
      where: { id: { in: lowIds.map(([id]) => id) }, isActive: true },
      include: { client: { select: { id: true, name: true } } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return lowIds
      .map(([id, available]) => ({ available, product: productMap.get(id) }))
      .filter((row) => row.product);
  }

  /** Последние заказы (для ленты активности). */
  async getRecentOrders(take = 6) {
    return this.prisma.marketplaceOrder.findMany({
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  /** Ближайшие плановые отгрузки. */
  async getUpcomingShipments(take = 5) {
    return this.prisma.shipment.findMany({
      where: { status: { in: ['PLANNED', 'IN_PROGRESS'] } },
      include: { _count: { select: { orders: true, supplies: true } } },
      orderBy: { scheduledAt: 'asc' },
      take,
    });
  }
}
