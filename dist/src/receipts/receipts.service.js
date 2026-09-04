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
exports.ReceiptsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stock_service_1 = require("../stock/stock.service");
let ReceiptsService = class ReceiptsService {
    constructor(prisma, stockService) {
        this.prisma = prisma;
        this.stockService = stockService;
    }
    findAll(filters) {
        return this.prisma.receipt.findMany({
            where: {
                ...(filters.clientId && { clientId: filters.clientId }),
                ...(filters.status && { status: filters.status }),
            },
            include: { client: { select: { id: true, name: true } }, items: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const receipt = await this.prisma.receipt.findUnique({
            where: { id },
            include: { client: true, warehouse: true, items: { include: { product: true } } },
        });
        if (!receipt)
            throw new common_1.NotFoundException('Приёмка не найдена');
        return receipt;
    }
    async create(input, userId) {
        const expectedItems = input.items.reduce((sum, i) => sum + i.expectedQty, 0);
        return this.prisma.receipt.create({
            data: {
                clientId: input.clientId,
                warehouseId: input.warehouseId,
                documentNumber: input.documentNumber,
                expectedPlaces: input.expectedPlaces,
                expectedItems,
                createdById: userId,
                items: {
                    create: input.items.map((i) => ({ productId: i.productId, expectedQty: i.expectedQty })),
                },
            },
            include: { items: { include: { product: true } } },
        });
    }
    async scanItem(receiptId, barcode, cellId, userId) {
        const receipt = await this.prisma.receipt.findUnique({ where: { id: receiptId } });
        if (!receipt)
            throw new common_1.NotFoundException('Приёмка не найдена');
        const product = await this.prisma.product.findFirst({
            where: { barcode, clientId: receipt.clientId },
        });
        if (!product) {
            throw new common_1.BadRequestException('Товар с этим штрихкодом не найден у данного клиента');
        }
        let item = await this.prisma.receiptItem.findFirst({ where: { receiptId, productId: product.id } });
        if (!item) {
            item = await this.prisma.receiptItem.create({
                data: { receiptId, productId: product.id, expectedQty: 0, actualQty: 0 },
            });
        }
        const newActual = item.actualQty + 1;
        const updatedItem = await this.prisma.receiptItem.update({
            where: { id: item.id },
            data: { actualQty: newActual, discrepancy: newActual - item.expectedQty, cellId },
        });
        await this.stockService.adjustPhysical({
            productId: product.id,
            clientId: receipt.clientId,
            cellId,
            delta: 1,
            reason: 'Приёмка',
            reference: `Приёмка №${receipt.documentNumber ?? receipt.id}`,
            userId,
        });
        if (receipt.status === 'DRAFT') {
            await this.prisma.receipt.update({ where: { id: receiptId }, data: { status: 'IN_PROGRESS' } });
        }
        return { item: updatedItem, product };
    }
    async complete(id) {
        return this.prisma.receipt.update({ where: { id }, data: { status: 'COMPLETED' } });
    }
};
exports.ReceiptsService = ReceiptsService;
exports.ReceiptsService = ReceiptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stock_service_1.StockService])
], ReceiptsService);
//# sourceMappingURL=receipts.service.js.map