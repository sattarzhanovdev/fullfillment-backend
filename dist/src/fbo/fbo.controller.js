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
exports.FboController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const fbo_service_1 = require("./fbo.service");
let FboController = class FboController {
    constructor(fboService) {
        this.fboService = fboService;
    }
    findAll(clientId, status) {
        const statuses = status ? status.split(',') : undefined;
        return this.fboService.findAll({ clientId, statuses });
    }
    findOne(id) {
        return this.fboService.findOne(id);
    }
    create(body) {
        return this.fboService.create(body);
    }
    updateStatus(id, status, user) {
        return this.fboService.transitionStatus(id, status, user.id);
    }
    scanPick(id, barcode) {
        return this.fboService.scanPick(id, barcode);
    }
    setBoxes(id, body) {
        return this.fboService.setBoxes(id, body.boxesCount, body.palletsCount);
    }
};
exports.FboController = FboController;
__decorate([
    (0, common_1.Get)('supplies'),
    __param(0, (0, common_1.Query)('clientId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FboController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('supplies/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FboController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('supplies'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.DIRECTOR, client_1.UserRole.MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FboController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('supplies/:id/status'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.DIRECTOR, client_1.UserRole.MANAGER, client_1.UserRole.STOREKEEPER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], FboController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('supplies/:id/pick'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.STOREKEEPER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('barcode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FboController.prototype, "scanPick", null);
__decorate([
    (0, common_1.Patch)('supplies/:id/boxes'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.STOREKEEPER, client_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FboController.prototype, "setBoxes", null);
exports.FboController = FboController = __decorate([
    (0, common_1.Controller)('fbo'),
    __metadata("design:paramtypes", [fbo_service_1.FboService])
], FboController);
//# sourceMappingURL=fbo.controller.js.map