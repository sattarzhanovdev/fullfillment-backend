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
exports.ShipmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ShipmentsService = class ShipmentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(filters) {
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
    async findOne(id) {
        const shipment = await this.prisma.shipment.findUnique({
            where: { id },
            include: {
                warehouse: true,
                orders: { include: { client: true, items: { include: { product: true } } } },
                supplies: { include: { client: true, items: { include: { product: true } } } },
            },
        });
        if (!shipment)
            throw new common_1.NotFoundException('Отгрузка не найдена');
        return shipment;
    }
    create(data) {
        return this.prisma.shipment.create({
            data: { ...data, scheduledAt: new Date(data.scheduledAt) },
        });
    }
    update(id, data) {
        return this.prisma.shipment.update({
            where: { id },
            data: { ...data, ...(data.scheduledAt && { scheduledAt: new Date(data.scheduledAt) }) },
        });
    }
    async addOrder(shipmentId, orderId) {
        await this.prisma.marketplaceOrder.update({ where: { id: orderId }, data: { shipmentId } });
        return this.recalculateTotals(shipmentId);
    }
    async addSupply(shipmentId, supplyId) {
        await this.prisma.supply.update({ where: { id: supplyId }, data: { shipmentId } });
        return this.recalculateTotals(shipmentId);
    }
    async recalculateTotals(shipmentId) {
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
};
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map