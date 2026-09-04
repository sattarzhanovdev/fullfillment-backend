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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stock_service_1 = require("../stock/stock.service");
function withVolume(product) {
    const l = product.lengthCm ? Number(product.lengthCm) : null;
    const w = product.widthCm ? Number(product.widthCm) : null;
    const h = product.heightCm ? Number(product.heightCm) : null;
    const volumeLiters = l && w && h ? Number(((l * w * h) / 1000).toFixed(3)) : null;
    return { ...product, volumeLiters };
}
let ProductsService = class ProductsService {
    constructor(prisma, stockService) {
        this.prisma = prisma;
        this.stockService = stockService;
    }
    async findAll(filters) {
        const products = await this.prisma.product.findMany({
            where: {
                ...(filters.clientId && { clientId: filters.clientId }),
                ...(filters.search && {
                    OR: [
                        { name: { contains: filters.search, mode: 'insensitive' } },
                        { article: { contains: filters.search, mode: 'insensitive' } },
                        { barcode: { contains: filters.search } },
                        { sku: { contains: filters.search, mode: 'insensitive' } },
                    ],
                }),
            },
            include: { client: { select: { id: true, name: true } }, packagingType: true },
            orderBy: { createdAt: 'desc' },
        });
        return products.map(withVolume);
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { client: true, packagingType: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Товар не найден');
        const totals = await this.stockService.getTotalsForProduct(id);
        return { ...withVolume(product), stock: totals };
    }
    async history(id) {
        return this.prisma.productHistoryEntry.findMany({
            where: { productId: id },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
    }
    create(data) {
        return this.prisma.product.create({ data });
    }
    update(id, data) {
        return this.prisma.product.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.product.update({ where: { id }, data: { isActive: false } });
    }
    findByBarcode(barcode, clientId) {
        return this.prisma.product.findFirst({
            where: { barcode, ...(clientId && { clientId }) },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stock_service_1.StockService])
], ProductsService);
//# sourceMappingURL=products.service.js.map