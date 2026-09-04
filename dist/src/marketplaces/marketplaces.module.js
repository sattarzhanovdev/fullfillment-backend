"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplacesModule = void 0;
const common_1 = require("@nestjs/common");
const marketplaces_service_1 = require("./marketplaces.service");
const marketplaces_controller_1 = require("./marketplaces.controller");
const wildberries_adapter_1 = require("./adapters/wildberries.adapter");
const ozon_adapter_1 = require("./adapters/ozon.adapter");
let MarketplacesModule = class MarketplacesModule {
};
exports.MarketplacesModule = MarketplacesModule;
exports.MarketplacesModule = MarketplacesModule = __decorate([
    (0, common_1.Module)({
        controllers: [marketplaces_controller_1.MarketplacesController],
        providers: [marketplaces_service_1.MarketplacesService, wildberries_adapter_1.WildberriesAdapter, ozon_adapter_1.OzonAdapter],
        exports: [marketplaces_service_1.MarketplacesService],
    })
], MarketplacesModule);
//# sourceMappingURL=marketplaces.module.js.map