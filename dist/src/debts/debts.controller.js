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
exports.DebtsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const debts_service_1 = require("./debts.service");
let DebtsController = class DebtsController {
    constructor(debtsService) {
        this.debtsService = debtsService;
    }
    findAll() {
        return this.debtsService.findAllSummaries();
    }
    getSummary(clientId) {
        return this.debtsService.getSummary(clientId);
    }
    charge(clientId, body) {
        return this.debtsService.charge(clientId, body.amount, body.reason, body.reference);
    }
    pay(clientId, body) {
        return this.debtsService.pay(clientId, body.amount, body.reason, body.reference);
    }
};
exports.DebtsController = DebtsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DebtsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':clientId'),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DebtsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Post)(':clientId/charge'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.DIRECTOR, client_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('clientId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DebtsController.prototype, "charge", null);
__decorate([
    (0, common_1.Post)(':clientId/pay'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.DIRECTOR, client_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('clientId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DebtsController.prototype, "pay", null);
exports.DebtsController = DebtsController = __decorate([
    (0, common_1.Controller)('debts'),
    __metadata("design:paramtypes", [debts_service_1.DebtsService])
], DebtsController);
//# sourceMappingURL=debts.controller.js.map