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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const analytics_service_1 = require("../analytics/analytics.service");
let ClientsService = class ClientsService {
    constructor(prisma, analyticsService) {
        this.prisma = prisma;
        this.analyticsService = analyticsService;
    }
    async findAll() {
        const clients = await this.prisma.client.findMany({
            include: {
                manager: { select: { id: true, fullName: true } },
                _count: { select: { products: true, orders: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const debts = await this.prisma.debtLedgerEntry.groupBy({
            by: ['clientId'],
            _sum: { amount: true },
        });
        const debtMap = new Map(debts.map((d) => [d.clientId, Number(d._sum.amount ?? 0)]));
        return clients.map((c) => ({
            ...c,
            productsCount: c._count.products,
            ordersCount: c._count.orders,
            debt: debtMap.get(c.id) ?? 0,
        }));
    }
    async findOne(id) {
        const client = await this.prisma.client.findUnique({
            where: { id },
            include: {
                manager: { select: { id: true, fullName: true } },
                requisites: true,
                contract: true,
                telegramLink: true,
                clientPrice: true,
                marketplaceLinks: true,
            },
        });
        if (!client)
            throw new common_1.NotFoundException('Клиент не найден');
        return client;
    }
    create(data) {
        return this.prisma.client.create({ data });
    }
    update(id, data) {
        return this.prisma.client.update({ where: { id }, data });
    }
    remove(id) {
        return this.prisma.client.update({ where: { id }, data: { status: 'ARCHIVED' } });
    }
    upsertRequisites(clientId, data) {
        return this.prisma.clientRequisites.upsert({
            where: { clientId },
            create: { clientId, ...data },
            update: data,
        });
    }
    upsertContract(clientId, data) {
        return this.prisma.contract.upsert({
            where: { clientId },
            create: { clientId, ...data, date: new Date(data.date), startDate: new Date(data.startDate) },
            update: { ...data, date: new Date(data.date), startDate: new Date(data.startDate) },
        });
    }
    async analytics(clientId, period = {}) {
        const from = period.from ? new Date(period.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const to = period.to ? new Date(period.to) : new Date();
        const [ordersCount, fbsCount, fboCount, revenueAgg, debtAgg] = await Promise.all([
            this.prisma.marketplaceOrder.count({
                where: { clientId, createdAt: { gte: from, lte: to } },
            }),
            this.prisma.marketplaceOrder.count({ where: { clientId, createdAt: { gte: from, lte: to } } }),
            this.prisma.supply.count({ where: { clientId, createdAt: { gte: from, lte: to } } }),
            this.prisma.marketplaceOrder.aggregate({
                where: { clientId, createdAt: { gte: from, lte: to } },
                _sum: { processingCost: true },
            }),
            this.prisma.debtLedgerEntry.aggregate({ where: { clientId }, _sum: { amount: true } }),
        ]);
        const [timeSeries, topProducts] = await Promise.all([
            this.analyticsService.timeSeries(from, to, clientId),
            this.analyticsService.topProducts(from, to, 5, clientId),
        ]);
        return {
            period: { from, to },
            ordersCount,
            fbsCount,
            fboCount,
            revenue: Number(revenueAgg._sum.processingCost ?? 0),
            debt: Number(debtAgg._sum.amount ?? 0),
            timeSeries,
            topProducts,
        };
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        analytics_service_1.AnalyticsService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map