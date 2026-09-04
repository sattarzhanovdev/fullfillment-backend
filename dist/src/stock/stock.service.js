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
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const events_gateway_1 = require("../events/events.gateway");
const settings_service_1 = require("../settings/settings.service");
const notifications_service_1 = require("../notifications/notifications.service");
let StockService = class StockService {
    constructor(prisma, auditLogService, eventsGateway, notificationsService, settingsService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.eventsGateway = eventsGateway;
        this.notificationsService = notificationsService;
        this.settingsService = settingsService;
    }
    async findMany(filters) {
        const rows = await this.prisma.stock.findMany({
            where: {
                ...(filters.clientId && { clientId: filters.clientId }),
                ...(filters.productId && { productId: filters.productId }),
                ...(filters.cellId && { cellId: filters.cellId }),
                cell: {
                    ...(filters.zoneId && { zoneId: filters.zoneId }),
                    ...(filters.warehouseId && { zone: { warehouseId: filters.warehouseId } }),
                },
                product: {
                    ...(filters.article && { article: { contains: filters.article, mode: 'insensitive' } }),
                    ...(filters.barcode && { barcode: { contains: filters.barcode } }),
                    ...(filters.name && { name: { contains: filters.name, mode: 'insensitive' } }),
                },
            },
            include: {
                product: true,
                client: { select: { id: true, name: true } },
                cell: { include: { zone: { include: { warehouse: true } } } },
            },
            orderBy: { updatedAt: 'desc' },
        });
        return rows.map((row) => ({
            ...row,
            availableQty: row.physicalQty - row.reservedQty - row.blockedQty,
        }));
    }
    async getTotalsForProduct(productId) {
        const rows = await this.prisma.stock.findMany({ where: { productId } });
        const physicalQty = rows.reduce((sum, r) => sum + r.physicalQty, 0);
        const reservedQty = rows.reduce((sum, r) => sum + r.reservedQty, 0);
        const blockedQty = rows.reduce((sum, r) => sum + r.blockedQty, 0);
        return {
            physicalQty,
            reservedQty,
            blockedQty,
            availableQty: physicalQty - reservedQty - blockedQty,
        };
    }
    async adjustPhysical(input) {
        return this.prisma.$transaction(async (tx) => {
            const stock = await tx.stock.upsert({
                where: { productId_cellId: { productId: input.productId, cellId: input.cellId } },
                create: {
                    productId: input.productId,
                    cellId: input.cellId,
                    clientId: input.clientId,
                    physicalQty: 0,
                    reservedQty: 0,
                    blockedQty: 0,
                },
                update: {},
            });
            const newQty = stock.physicalQty + input.delta;
            if (newQty < 0) {
                throw new common_1.BadRequestException('Недостаточно физического остатка для списания');
            }
            const updated = await tx.stock.update({
                where: { id: stock.id },
                data: { physicalQty: newQty },
            });
            await tx.productHistoryEntry.create({
                data: {
                    productId: input.productId,
                    delta: input.delta,
                    reason: input.reason,
                    reference: input.reference,
                    userId: input.userId ?? null,
                },
            });
            await this.auditLogService.log({
                userId: input.userId,
                action: 'STOCK_ADJUST',
                entityType: 'Stock',
                entityId: stock.id,
                oldValue: { physicalQty: stock.physicalQty },
                newValue: { physicalQty: newQty },
            });
            this.eventsGateway.emitStockUpdated({ productId: input.productId, clientId: input.clientId });
            return updated;
        });
    }
    async reserve(params) {
        return this.prisma.$transaction(async (tx) => {
            const stocks = await tx.stock.findMany({
                where: { productId: params.productId, clientId: params.clientId },
                orderBy: { physicalQty: 'desc' },
            });
            const totalAvailable = stocks.reduce((sum, s) => sum + (s.physicalQty - s.reservedQty - s.blockedQty), 0);
            if (totalAvailable < params.qty) {
                throw new common_1.BadRequestException('Недостаточно доступного остатка для резервирования');
            }
            let remaining = params.qty;
            for (const s of stocks) {
                if (remaining <= 0)
                    break;
                const available = s.physicalQty - s.reservedQty - s.blockedQty;
                if (available <= 0)
                    continue;
                const take = Math.min(available, remaining);
                await tx.stock.update({ where: { id: s.id }, data: { reservedQty: { increment: take } } });
                remaining -= take;
            }
            const reservation = await tx.reservation.create({
                data: {
                    productId: params.productId,
                    clientId: params.clientId,
                    qty: params.qty,
                    orderId: params.orderId,
                    supplyId: params.supplyId,
                },
            });
            this.eventsGateway.emitStockUpdated({ productId: params.productId, clientId: params.clientId });
            return reservation;
        });
    }
    async release(reservationId) {
        return this.prisma.$transaction(async (tx) => {
            const reservation = await tx.reservation.findUnique({ where: { id: reservationId } });
            if (!reservation || reservation.isReleased)
                return reservation;
            let remaining = reservation.qty;
            const stocks = await tx.stock.findMany({
                where: { productId: reservation.productId, clientId: reservation.clientId, reservedQty: { gt: 0 } },
                orderBy: { reservedQty: 'desc' },
            });
            for (const s of stocks) {
                if (remaining <= 0)
                    break;
                const take = Math.min(s.reservedQty, remaining);
                await tx.stock.update({ where: { id: s.id }, data: { reservedQty: { decrement: take } } });
                remaining -= take;
            }
            const updated = await tx.reservation.update({
                where: { id: reservationId },
                data: { isReleased: true, releasedAt: new Date() },
            });
            this.eventsGateway.emitStockUpdated({ productId: reservation.productId, clientId: reservation.clientId });
            return updated;
        });
    }
    async consumeReservation(reservationId, userId, reference) {
        const result = await this.prisma.$transaction(async (tx) => {
            const reservation = await tx.reservation.findUnique({ where: { id: reservationId } });
            if (!reservation || reservation.isReleased)
                return { reservation, shortfall: 0 };
            let remaining = reservation.qty;
            let shortfall = 0;
            const stocks = await tx.stock.findMany({
                where: { productId: reservation.productId, clientId: reservation.clientId, reservedQty: { gt: 0 } },
                orderBy: { reservedQty: 'desc' },
            });
            for (const s of stocks) {
                if (remaining <= 0)
                    break;
                const releaseQty = Math.min(s.reservedQty, remaining);
                const physicalDecrement = Math.min(releaseQty, s.physicalQty);
                shortfall += releaseQty - physicalDecrement;
                await tx.stock.update({
                    where: { id: s.id },
                    data: { reservedQty: { decrement: releaseQty }, physicalQty: { decrement: physicalDecrement } },
                });
                if (physicalDecrement > 0) {
                    await tx.productHistoryEntry.create({
                        data: {
                            productId: reservation.productId,
                            delta: -physicalDecrement,
                            reason: 'Отгрузка',
                            reference,
                            userId: userId ?? null,
                        },
                    });
                }
                remaining -= releaseQty;
            }
            const updated = await tx.reservation.update({
                where: { id: reservationId },
                data: { isReleased: true, releasedAt: new Date() },
            });
            if (shortfall > 0) {
                await this.auditLogService.log({
                    userId,
                    action: 'STOCK_SHORTFALL',
                    entityType: 'Reservation',
                    entityId: reservationId,
                    newValue: { productId: reservation.productId, clientId: reservation.clientId, shortfall, reference },
                });
            }
            return { reservation: updated, shortfall };
        });
        if (result.reservation) {
            this.eventsGateway.emitStockUpdated({
                productId: result.reservation.productId,
                clientId: result.reservation.clientId,
            });
        }
        if (result.shortfall > 0 && result.reservation) {
            await this.notificationsService.create({
                clientId: result.reservation.clientId,
                type: 'DISCREPANCY',
                title: 'Расхождение остатка при отгрузке',
                message: `Не хватило ${result.shortfall} шт. физического остатка для полного списания резерва (${reference ?? 'без ссылки'}). Требуется инвентаризация.`,
            });
        }
        return result.reservation;
    }
    async transferBetweenCells(params) {
        return this.prisma.$transaction(async (tx) => {
            const fromStock = await tx.stock.findUnique({
                where: { productId_cellId: { productId: params.productId, cellId: params.fromCellId } },
            });
            const available = fromStock ? fromStock.physicalQty - fromStock.reservedQty - fromStock.blockedQty : 0;
            if (available < params.qty) {
                throw new common_1.BadRequestException('Недостаточно доступного остатка в исходной ячейке');
            }
            await tx.stock.update({
                where: { id: fromStock.id },
                data: { physicalQty: { decrement: params.qty } },
            });
            await tx.stock.upsert({
                where: { productId_cellId: { productId: params.productId, cellId: params.toCellId } },
                create: {
                    productId: params.productId,
                    cellId: params.toCellId,
                    clientId: params.clientId,
                    physicalQty: params.qty,
                    reservedQty: 0,
                    blockedQty: 0,
                },
                update: { physicalQty: { increment: params.qty } },
            });
            const movement = await tx.movement.create({
                data: {
                    productId: params.productId,
                    fromCellId: params.fromCellId,
                    toCellId: params.toCellId,
                    qty: params.qty,
                    userId: params.userId ?? null,
                },
            });
            await this.auditLogService.log({
                userId: params.userId,
                action: 'STOCK_MOVE',
                entityType: 'Movement',
                entityId: movement.id,
                newValue: params,
            });
            this.eventsGateway.emitStockUpdated({ productId: params.productId, clientId: params.clientId });
            return movement;
        });
    }
    async resolveBufferPercent(productId) {
        const product = await this.prisma.product.findUniqueOrThrow({
            where: { id: productId },
            include: { client: true },
        });
        if (product.bufferPercent !== null && product.bufferPercent !== undefined) {
            return Number(product.bufferPercent);
        }
        if (product.client.bufferPercent !== null && product.client.bufferPercent !== undefined) {
            return Number(product.client.bufferPercent);
        }
        const general = await this.settingsService?.get(settings_service_1.SETTING_KEYS.GENERAL_BUFFER_PERCENT);
        return general ?? 0;
    }
    async showcaseQtyForProduct(productId) {
        const totals = await this.getTotalsForProduct(productId);
        const bufferPercent = await this.resolveBufferPercent(productId);
        const showcaseQty = Math.max(0, Math.floor(totals.availableQty * (1 - bufferPercent / 100)));
        return { ...totals, bufferPercent, showcaseQty };
    }
    async previewBuffer(productId, newBufferPercent) {
        const totals = await this.getTotalsForProduct(productId);
        const currentBufferPercent = await this.resolveBufferPercent(productId);
        const before = Math.max(0, Math.floor(totals.availableQty * (1 - currentBufferPercent / 100)));
        const after = Math.max(0, Math.floor(totals.availableQty * (1 - newBufferPercent / 100)));
        return { before, after };
    }
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        events_gateway_1.EventsGateway,
        notifications_service_1.NotificationsService,
        settings_service_1.SettingsService])
], StockService);
//# sourceMappingURL=stock.service.js.map