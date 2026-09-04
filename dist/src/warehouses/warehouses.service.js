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
exports.WarehousesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WarehousesService = class WarehousesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAllWarehouses() {
        return this.prisma.warehouse.findMany({
            include: { zones: { include: { cells: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
    async findWarehouse(id) {
        const warehouse = await this.prisma.warehouse.findUnique({
            where: { id },
            include: { zones: { include: { cells: true } } },
        });
        if (!warehouse)
            throw new common_1.NotFoundException('Склад не найден');
        return warehouse;
    }
    createWarehouse(data) {
        return this.prisma.warehouse.create({ data });
    }
    updateWarehouse(id, data) {
        return this.prisma.warehouse.update({ where: { id }, data });
    }
    createZone(warehouseId, data) {
        return this.prisma.zone.create({ data: { ...data, warehouseId } });
    }
    updateZone(id, data) {
        return this.prisma.zone.update({ where: { id }, data });
    }
    removeZone(id) {
        return this.prisma.zone.delete({ where: { id } });
    }
    findCells(params) {
        return this.prisma.cell.findMany({
            where: {
                ...(params.zoneId && { zoneId: params.zoneId }),
                ...(params.warehouseId && { zone: { warehouseId: params.warehouseId } }),
            },
            include: { zone: { include: { warehouse: true } } },
            orderBy: { code: 'asc' },
        });
    }
    async findCell(id) {
        const cell = await this.prisma.cell.findUnique({
            where: { id },
            include: { zone: { include: { warehouse: true } }, stocks: { include: { product: true, client: true } } },
        });
        if (!cell)
            throw new common_1.NotFoundException('Ячейка не найдена');
        return cell;
    }
    createCell(zoneId, data) {
        return this.prisma.cell.create({ data: { ...data, zoneId } });
    }
    updateCell(id, data) {
        return this.prisma.cell.update({ where: { id }, data });
    }
    removeCell(id) {
        return this.prisma.cell.delete({ where: { id } });
    }
};
exports.WarehousesService = WarehousesService;
exports.WarehousesService = WarehousesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarehousesService);
//# sourceMappingURL=warehouses.service.js.map