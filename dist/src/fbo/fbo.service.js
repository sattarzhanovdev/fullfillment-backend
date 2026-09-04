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
exports.FboService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stock_service_1 = require("../stock/stock.service");
const events_gateway_1 = require("../events/events.gateway");
const supply_funnel_1 = require("./supply-funnel");
let FboService = class FboService {
    constructor(prisma, stockService, eventsGateway) {
        this.prisma = prisma;
        this.stockService = stockService;
        this.eventsGateway = eventsGateway;
    }
    findAll(filters) {
        return this.prisma.supply.findMany({
            where: {
                ...(filters.clientId && { clientId: filters.clientId }),
                ...(filters.statuses && filters.statuses.length > 0 && { status: { in: filters.statuses } }),
            },
            include: {
                client: { select: { id: true, name: true } },
                items: { include: { product: true } },
                assignee: { select: { id: true, fullName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const supply = await this.prisma.supply.findUnique({
            where: { id },
            include: {
                client: true,
                items: { include: { product: true } },
                statusHistory: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!supply)
            throw new common_1.NotFoundException('Поставка не найдена');
        return supply;
    }
    async create(input) {
        const supply = await this.prisma.supply.create({
            data: {
                supplyNumber: input.supplyNumber,
                clientId: input.clientId,
                marketplace: input.marketplace,
                marketplaceWarehouse: input.marketplaceWarehouse,
                deadline: input.deadline ? new Date(input.deadline) : undefined,
                items: { create: input.items.map((i) => ({ productId: i.productId, qtyNeeded: i.qtyNeeded })) },
            },
            include: { items: true },
        });
        for (const item of supply.items) {
            try {
                await this.stockService.reserve({
                    productId: item.productId,
                    clientId: input.clientId,
                    qty: item.qtyNeeded,
                    supplyId: supply.id,
                });
            }
            catch {
            }
        }
        return this.findOne(supply.id);
    }
    async transitionStatus(id, status, userId) {
        const supply = await this.prisma.supply.findUnique({ where: { id }, include: { reservations: true } });
        if (!supply)
            throw new common_1.NotFoundException('Поставка не найдена');
        if (!(0, supply_funnel_1.isSupplyTransitionAllowed)(supply.status, status)) {
            throw new common_1.BadRequestException(`Переход из статуса ${supply.status} в ${status} запрещён бизнес-логикой`);
        }
        if (status === 'CANCELLED') {
            for (const r of supply.reservations.filter((r) => !r.isReleased)) {
                await this.stockService.release(r.id);
            }
        }
        if (status === 'SHIPPED') {
            for (const r of supply.reservations.filter((r) => !r.isReleased)) {
                await this.stockService.consumeReservation(r.id, userId, `FBO поставка №${supply.supplyNumber}`);
            }
        }
        const updated = await this.prisma.supply.update({ where: { id }, data: { status } });
        await this.prisma.supplyStatusHistory.create({ data: { supplyId: id, status, userId: userId ?? null } });
        this.eventsGateway.emitSupplyUpdated({ supplyId: id, status });
        return updated;
    }
    async scanPick(supplyId, barcode) {
        const item = await this.prisma.supplyItem.findFirst({ where: { supplyId, product: { barcode } } });
        if (!item)
            throw new common_1.BadRequestException('Товар не относится к этой поставке');
        if (item.qtyPicked >= item.qtyNeeded)
            throw new common_1.BadRequestException('Позиция уже полностью собрана');
        const updated = await this.prisma.supplyItem.update({
            where: { id: item.id },
            data: { qtyPicked: { increment: 1 } },
        });
        const supply = await this.prisma.supply.findUniqueOrThrow({ where: { id: supplyId } });
        if (supply.status === 'CREATED') {
            await this.transitionStatus(supplyId, 'PICKING');
        }
        const items = await this.prisma.supplyItem.findMany({ where: { supplyId } });
        if (items.every((i) => i.qtyPicked >= i.qtyNeeded)) {
            await this.transitionStatus(supplyId, 'PICKED');
        }
        return updated;
    }
    setBoxes(id, boxesCount, palletsCount) {
        return this.prisma.supply.update({ where: { id }, data: { boxesCount, palletsCount } });
    }
};
exports.FboService = FboService;
exports.FboService = FboService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stock_service_1.StockService,
        events_gateway_1.EventsGateway])
], FboService);
//# sourceMappingURL=fbo.service.js.map