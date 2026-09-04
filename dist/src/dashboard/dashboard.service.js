"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const analytics_service_1 = require("../analytics/analytics.service");
function startOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
function startOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}
let DashboardService = class DashboardService {
    constructor(prisma, analyticsService) {
        this.prisma = prisma;
        this.analyticsService = analyticsService;
    }
    async getSummary() {
        const today = startOfDay();
        const monthStart = startOfMonth();
        const [totalClients, activeClients, totalProducts, stockAgg, ordersToday, ordersPicking, ordersPacked, ordersAwaitingShipment, shippedToday, fbsOrdersCount, fboSuppliesCount, revenueDay, revenueMonth, debtsAgg, blockedDebtOrders, needsPriceOrders, productsWithoutDimensions,] = await Promise.all([
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
        const byProduct = new Map();
        for (const s of stocks)
            byProduct.set(s.productId, (byProduct.get(s.productId) ?? 0) + s.physicalQty - s.reservedQty);
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
    async getTrend(days = 14) {
        const to = new Date();
        const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
        return this.analyticsService.timeSeries(from, to);
    }
    async getAttentionOrders(take = 8) {
        return this.prisma.marketplaceOrder.findMany({
            where: { status: { in: ['NEEDS_PRICE', 'BLOCKED_DEBT', 'ITEM_NOT_FOUND', 'ERROR', 'NEEDS_CLARIFICATION'] } },
            include: { client: { select: { id: true, name: true } } },
            orderBy: { updatedAt: 'desc' },
            take,
        });
    }
    async getLowStockProducts(take = 8) {
        const stocks = await this.prisma.stock.findMany({
            select: { productId: true, physicalQty: true, reservedQty: true },
        });
        const byProduct = new Map();
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
    async getRecentOrders(take = 6) {
        return this.prisma.marketplaceOrder.findMany({
            include: { client: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
            take,
        });
    }
    async getUpcomingShipments(take = 5) {
        return this.prisma.shipment.findMany({
            where: { status: { in: ['PLANNED', 'IN_PROGRESS'] } },
            include: { _count: { select: { orders: true, supplies: true } } },
            orderBy: { scheduledAt: 'asc' },
            take,
        });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        analytics_service_1.AnalyticsService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map