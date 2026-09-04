"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OzonAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OzonAdapter = void 0;
const common_1 = require("@nestjs/common");
let OzonAdapter = OzonAdapter_1 = class OzonAdapter {
    constructor() {
        this.logger = new common_1.Logger(OzonAdapter_1.name);
    }
    async fetchOrders(_apiKey) {
        this.logger.log('fetchOrders: заглушка Ozon API, реальный вызов не выполнен');
        return [];
    }
    async fetchStock(_apiKey) {
        this.logger.log('fetchStock: заглушка Ozon API, реальный вызов не выполнен');
        return [];
    }
    async fetchSupplies(_apiKey) {
        this.logger.log('fetchSupplies: заглушка Ozon API, реальный вызов не выполнен');
        return [];
    }
    async pushLabels(_apiKey, _orderNumbers) {
        this.logger.log('pushLabels: заглушка Ozon API, реальный вызов не выполнен');
    }
};
exports.OzonAdapter = OzonAdapter;
exports.OzonAdapter = OzonAdapter = OzonAdapter_1 = __decorate([
    (0, common_1.Injectable)()
], OzonAdapter);
//# sourceMappingURL=ozon.adapter.js.map