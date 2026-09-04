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
exports.MarketplacesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const wildberries_adapter_1 = require("./adapters/wildberries.adapter");
const ozon_adapter_1 = require("./adapters/ozon.adapter");
let MarketplacesService = class MarketplacesService {
    constructor(prisma, wbAdapter, ozonAdapter) {
        this.prisma = prisma;
        this.wbAdapter = wbAdapter;
        this.ozonAdapter = ozonAdapter;
    }
    resolveAdapter(marketplace) {
        if (marketplace === 'WILDBERRIES')
            return this.wbAdapter;
        if (marketplace === 'OZON')
            return this.ozonAdapter;
        throw new common_1.BadRequestException('Интеграция для этого маркетплейса пока не поддерживается');
    }
    findForClient(clientId) {
        return this.prisma.marketplaceIntegration.findMany({ where: { clientId } });
    }
    async upsert(clientId, marketplace, data) {
        return this.prisma.marketplaceIntegration.upsert({
            where: { clientId_marketplace: { clientId, marketplace } },
            create: { clientId, marketplace, ...data, status: data.apiKey ? 'CONNECTED' : 'NOT_CONNECTED' },
            update: { ...data, status: data.apiKey ? 'CONNECTED' : 'NOT_CONNECTED' },
        });
    }
    async sync(integrationId) {
        const integration = await this.prisma.marketplaceIntegration.findUnique({ where: { id: integrationId } });
        if (!integration)
            throw new common_1.NotFoundException('Интеграция не найдена');
        if (!integration.apiKey)
            throw new common_1.BadRequestException('Не указан API-ключ интеграции');
        const adapter = this.resolveAdapter(integration.marketplace);
        try {
            await this.prisma.marketplaceIntegration.update({ where: { id: integrationId }, data: { status: 'SYNCING' } });
            await adapter.fetchOrders(integration.apiKey);
            await adapter.fetchStock(integration.apiKey);
            return this.prisma.marketplaceIntegration.update({
                where: { id: integrationId },
                data: { status: 'CONNECTED', lastSyncAt: new Date() },
            });
        }
        catch (error) {
            await this.prisma.marketplaceIntegration.update({ where: { id: integrationId }, data: { status: 'ERROR' } });
            throw error;
        }
    }
};
exports.MarketplacesService = MarketplacesService;
exports.MarketplacesService = MarketplacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wildberries_adapter_1.WildberriesAdapter,
        ozon_adapter_1.OzonAdapter])
], MarketplacesService);
//# sourceMappingURL=marketplaces.service.js.map