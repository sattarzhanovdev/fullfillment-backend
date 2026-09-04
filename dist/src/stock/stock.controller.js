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
exports.StockController = void 0;
const common_1 = require("@nestjs/common");
const stock_service_1 = require("./stock.service");
let StockController = class StockController {
    constructor(stockService) {
        this.stockService = stockService;
    }
    findMany(clientId, productId, article, barcode, name, warehouseId, zoneId, cellId) {
        return this.stockService.findMany({ clientId, productId, article, barcode, name, warehouseId, zoneId, cellId });
    }
    getTotals(productId) {
        return this.stockService.getTotalsForProduct(productId);
    }
    getShowcase(productId) {
        return this.stockService.showcaseQtyForProduct(productId);
    }
    previewBuffer(productId, bufferPercent) {
        return this.stockService.previewBuffer(productId, bufferPercent);
    }
};
exports.StockController = StockController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('clientId')),
    __param(1, (0, common_1.Query)('productId')),
    __param(2, (0, common_1.Query)('article')),
    __param(3, (0, common_1.Query)('barcode')),
    __param(4, (0, common_1.Query)('name')),
    __param(5, (0, common_1.Query)('warehouseId')),
    __param(6, (0, common_1.Query)('zoneId')),
    __param(7, (0, common_1.Query)('cellId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "findMany", null);
__decorate([
    (0, common_1.Get)('product/:productId/totals'),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getTotals", null);
__decorate([
    (0, common_1.Get)('product/:productId/showcase'),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getShowcase", null);
__decorate([
    (0, common_1.Post)('product/:productId/preview-buffer'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)('bufferPercent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "previewBuffer", null);
exports.StockController = StockController = __decorate([
    (0, common_1.Controller)('stock'),
    __metadata("design:paramtypes", [stock_service_1.StockService])
], StockController);
//# sourceMappingURL=stock.controller.js.map