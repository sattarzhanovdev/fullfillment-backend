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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stock_service_1 = require("../stock/stock.service");
let InventoryService = class InventoryService {
    constructor(prisma, stockService) {
        this.prisma = prisma;
        this.stockService = stockService;
    }
    findAll() {
        return this.prisma.inventoryCount.findMany({
            include: { client: { select: { id: true, name: true } }, _count: { select: { lines: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const count = await this.prisma.inventoryCount.findUnique({
            where: { id },
            include: { client: true },
        });
        if (!count)
            throw new common_1.NotFoundException('Инвентаризация не найдена');
        const lines = await this.prisma.inventoryLine.findMany({ where: { inventoryCountId: id } });
        const productIds = lines.map((l) => l.productId);
        const products = await this.prisma.product.findMany({ where: { id: { in: productIds } } });
        const productMap = new Map(products.map((p) => [p.id, p]));
        return { ...count, lines: lines.map((l) => ({ ...l, product: productMap.get(l.productId) })) };
    }
    async create(input, userId) {
        const stockWhere = {
            ...(input.clientId && { clientId: input.clientId }),
            ...(input.cellId && { cellId: input.cellId }),
            cell: {
                ...(input.zoneId && { zoneId: input.zoneId }),
                ...(input.warehouseId && { zone: { warehouseId: input.warehouseId } }),
            },
            ...(input.productIds && input.productIds.length > 0 && { productId: { in: input.productIds } }),
        };
        const stocks = await this.prisma.stock.findMany({ where: stockWhere });
        const byProduct = new Map();
        for (const s of stocks) {
            byProduct.set(s.productId, (byProduct.get(s.productId) ?? 0) + s.physicalQty);
        }
        return this.prisma.inventoryCount.create({
            data: {
                scope: input.scope,
                warehouseId: input.warehouseId,
                clientId: input.clientId,
                zoneId: input.zoneId,
                cellId: input.cellId,
                createdById: userId,
                lines: {
                    create: Array.from(byProduct.entries()).map(([productId, systemQty]) => ({
                        productId,
                        systemQty,
                    })),
                },
            },
            include: { lines: true },
        });
    }
    async scanLine(inventoryCountId, productId) {
        let line = await this.prisma.inventoryLine.findFirst({ where: { inventoryCountId, productId } });
        if (!line) {
            line = await this.prisma.inventoryLine.create({
                data: { inventoryCountId, productId, systemQty: 0, actualQty: 0 },
            });
        }
        const actualQty = (line.actualQty ?? 0) + 1;
        return this.prisma.inventoryLine.update({
            where: { id: line.id },
            data: { actualQty, discrepancy: actualQty - line.systemQty },
        });
    }
    async complete(id, userId) {
        const count = await this.prisma.inventoryCount.findUnique({ where: { id }, include: { lines: true } });
        if (!count)
            throw new common_1.NotFoundException('Инвентаризация не найдена');
        for (const line of count.lines) {
            if (line.actualQty === null)
                continue;
            const discrepancy = line.actualQty - line.systemQty;
            if (discrepancy === 0)
                continue;
            const targetStock = await this.prisma.stock.findFirst({
                where: {
                    productId: line.productId,
                    ...(count.clientId && { clientId: count.clientId }),
                    ...(count.cellId && { cellId: count.cellId }),
                },
                orderBy: { physicalQty: 'desc' },
            });
            if (!targetStock)
                continue;
            await this.stockService.adjustPhysical({
                productId: line.productId,
                clientId: targetStock.clientId,
                cellId: targetStock.cellId,
                delta: discrepancy,
                reason: 'Инвентаризация',
                reference: `Инвентаризация №${count.id}`,
                userId,
            });
        }
        return this.prisma.inventoryCount.update({
            where: { id },
            data: { status: 'completed', completedAt: new Date() },
        });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stock_service_1.StockService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map