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
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PricingService = class PricingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    computeLiters(lengthCm, widthCm, heightCm) {
        if (!lengthCm || !widthCm || !heightCm)
            return null;
        const volumeLiters = (lengthCm * widthCm * heightCm) / 1000;
        const rounded = Math.round(volumeLiters * 10000) / 10000;
        return Math.max(1, Math.ceil(rounded));
    }
    priceByLiters(liters, firstLiterPrice, nextLiterPrice) {
        return Number((firstLiterPrice + (liters - 1) * nextLiterPrice).toFixed(2));
    }
    async getGeneralRule() {
        return this.prisma.priceRule.findFirst({ orderBy: { updatedAt: 'desc' } });
    }
    async setGeneralRule(firstLiterPrice, nextLiterPrice) {
        const existing = await this.getGeneralRule();
        if (existing) {
            return this.prisma.priceRule.update({
                where: { id: existing.id },
                data: { firstLiterPrice, nextLiterPrice },
            });
        }
        return this.prisma.priceRule.create({ data: { firstLiterPrice, nextLiterPrice } });
    }
    async getClientPrice(clientId) {
        return this.prisma.clientPrice.findUnique({ where: { clientId } });
    }
    async setClientPrice(clientId, data) {
        return this.prisma.clientPrice.upsert({
            where: { clientId },
            create: { clientId, ...data },
            update: data,
        });
    }
    async calculateForProduct(productId) {
        const product = await this.prisma.product.findUniqueOrThrow({ where: { id: productId } });
        if (product.fbsProcessingPrice !== null && product.fbsProcessingPrice !== undefined) {
            return { price: Number(product.fbsProcessingPrice), source: 'PRODUCT' };
        }
        const clientPrice = await this.getClientPrice(product.clientId);
        const liters = this.computeLiters(product.lengthCm ? Number(product.lengthCm) : null, product.widthCm ? Number(product.widthCm) : null, product.heightCm ? Number(product.heightCm) : null);
        if (clientPrice?.flatPrice !== null && clientPrice?.flatPrice !== undefined) {
            return { price: Number(clientPrice.flatPrice), source: 'CLIENT_FLAT' };
        }
        if (clientPrice?.firstLiterPrice !== null &&
            clientPrice?.firstLiterPrice !== undefined &&
            clientPrice?.nextLiterPrice !== null &&
            clientPrice?.nextLiterPrice !== undefined) {
            if (liters === null) {
                return { price: null, source: 'NEEDS_PRICE', reason: 'Нет габаритов товара' };
            }
            return {
                price: this.priceByLiters(liters, Number(clientPrice.firstLiterPrice), Number(clientPrice.nextLiterPrice)),
                source: 'CLIENT_FORMULA',
                liters,
            };
        }
        const general = await this.getGeneralRule();
        if (general) {
            if (liters === null) {
                return { price: null, source: 'NEEDS_PRICE', reason: 'Нет габаритов товара' };
            }
            return {
                price: this.priceByLiters(liters, Number(general.firstLiterPrice), Number(general.nextLiterPrice)),
                source: 'GENERAL',
                liters,
            };
        }
        return { price: null, source: 'NEEDS_PRICE', reason: 'Нет подходящих условий для расчёта цены' };
    }
    async findNeedsPriceQueue() {
        const products = await this.prisma.product.findMany({
            where: { isActive: true },
            include: { client: true },
        });
        const results = [];
        for (const product of products) {
            const result = await this.calculateForProduct(product.id);
            if (result.source === 'NEEDS_PRICE') {
                results.push({ product, result });
            }
        }
        return results;
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PricingService);
//# sourceMappingURL=pricing.service.js.map