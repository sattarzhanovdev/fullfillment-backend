"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FboModule = void 0;
const common_1 = require("@nestjs/common");
const fbo_service_1 = require("./fbo.service");
const fbo_controller_1 = require("./fbo.controller");
let FboModule = class FboModule {
};
exports.FboModule = FboModule;
exports.FboModule = FboModule = __decorate([
    (0, common_1.Module)({
        controllers: [fbo_controller_1.FboController],
        providers: [fbo_service_1.FboService],
        exports: [fbo_service_1.FboService],
    })
], FboModule);
//# sourceMappingURL=fbo.module.js.map