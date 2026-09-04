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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplacesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const marketplaces_service_1 = require("./marketplaces.service");
let MarketplacesController = class MarketplacesController {
    constructor(marketplacesService) {
        this.marketplacesService = marketplacesService;
        this.logger = new common_1.Logger('WebhooksController');
    }
    findForClient(clientId) {
        return this.marketplacesService.findForClient(clientId);
    }
    upsert(clientId, marketplace, body) {
        return this.marketplacesService.upsert(clientId, marketplace, body);
    }
    sync(integrationId) {
        return this.marketplacesService.sync(integrationId);
    }
    handleWebhook(event, payload) {
        this.logger.log(`Получен webhook ${event}: ${JSON.stringify(payload)}`);
        return { received: true };
    }
};
exports.MarketplacesController = MarketplacesController;
__decorate([
    (0, common_1.Get)('client/:clientId'),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarketplacesController.prototype, "findForClient", null);
__decorate([
    (0, common_1.Post)('client/:clientId/:marketplace'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.DIRECTOR, client_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('clientId')),
    __param(1, (0, common_1.Param)('marketplace')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], MarketplacesController.prototype, "upsert", null);
__decorate([
    (0, common_1.Post)(':integrationId/sync'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.DIRECTOR, client_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('integrationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarketplacesController.prototype, "sync", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('webhooks/:event'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('event')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MarketplacesController.prototype, "handleWebhook", null);
exports.MarketplacesController = MarketplacesController = __decorate([
    (0, common_1.Controller)('marketplaces'),
    __metadata("design:paramtypes", [marketplaces_service_1.MarketplacesService])
], MarketplacesController);
//# sourceMappingURL=marketplaces.controller.js.map