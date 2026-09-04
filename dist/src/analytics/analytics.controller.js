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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const analytics_service_1 = require("./analytics.service");
function parseRange(from, to) {
    return {
        from: from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: to ? new Date(to) : new Date(),
    };
}
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    orders(from, to) {
        const { from: f, to: t } = parseRange(from, to);
        return this.analyticsService.ordersReport(f, t);
    }
    warehouse() {
        return this.analyticsService.warehouseReport();
    }
    finance(from, to) {
        const { from: f, to: t } = parseRange(from, to);
        return this.analyticsService.financeReport(f, t);
    }
    efficiency(from, to) {
        const { from: f, to: t } = parseRange(from, to);
        return this.analyticsService.operationalEfficiency(f, t);
    }
    kpi(from, to) {
        const { from: f, to: t } = parseRange(from, to);
        return this.analyticsService.employeeKpi(f, t);
    }
    timeSeries(from, to, clientId) {
        const { from: f, to: t } = parseRange(from, to);
        return this.analyticsService.timeSeries(f, t, clientId);
    }
    topProducts(from, to, limit, clientId) {
        const { from: f, to: t } = parseRange(from, to);
        return this.analyticsService.topProducts(f, t, limit ? Number(limit) : 10, clientId);
    }
    topClients(from, to, limit) {
        const { from: f, to: t } = parseRange(from, to);
        return this.analyticsService.topClients(f, t, limit ? Number(limit) : 10);
    }
    comparison(from, to) {
        const { from: f, to: t } = parseRange(from, to);
        return this.analyticsService.periodComparison(f, t);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "orders", null);
__decorate([
    (0, common_1.Get)('warehouse'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "warehouse", null);
__decorate([
    (0, common_1.Get)('finance'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "finance", null);
__decorate([
    (0, common_1.Get)('efficiency'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "efficiency", null);
__decorate([
    (0, common_1.Get)('kpi'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "kpi", null);
__decorate([
    (0, common_1.Get)('timeseries'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "timeSeries", null);
__decorate([
    (0, common_1.Get)('top-products'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "topProducts", null);
__decorate([
    (0, common_1.Get)('top-clients'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "topClients", null);
__decorate([
    (0, common_1.Get)('comparison'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "comparison", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.DIRECTOR),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map