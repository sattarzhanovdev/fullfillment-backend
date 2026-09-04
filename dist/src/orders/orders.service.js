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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stock_service_1 = require("../stock/stock.service");
const pricing_service_1 = require("../pricing/pricing.service");
const debts_service_1 = require("../debts/debts.service");
const notifications_service_1 = require("../notifications/notifications.service");
const events_gateway_1 = require("../events/events.gateway");
const order_funnel_1 = require("./order-funnel");
let OrdersService = class OrdersService {
    constructor(prisma, stockService, pricingService, debtsService, notificationsService, eventsGateway) {
        this.prisma = prisma;
        this.stockService = stockService;
        this.pricingService = pricingService;
        this.debtsService = debtsService;
        this.notificationsService = notificationsService;
        this.eventsGateway = eventsGateway;
    }
    findAll(filters) {
        return this.prisma.marketplaceOrder.findMany({
            where: {
                ...(filters.clientId && { clientId: filters.clientId }),
                ...(filters.statuses && filters.statuses.length > 0 && { status: { in: filters.statuses } }),
                ...(filters.marketplace && { marketplace: filters.marketplace }),
            },
            include: {
                client: { select: { id: true, name: true } },
                items: { include: { product: true } },
                assignee: { select: { id: true, fullName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const order = await this.prisma.marketplaceOrder.findUnique({
            where: { id },
            include: {
                client: true,
                items: { include: { product: true } },
                statusHistory: { orderBy: { createdAt: 'desc' } },
                assignee: { select: { id: true, fullName: true } },
                packagingType: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Заказ не найден');
        return order;
    }
    async create(input) {
        const order = await this.prisma.marketplaceOrder.create({
            data: {
                orderNumber: input.orderNumber,
                marketplace: input.marketplace,
                clientId: input.clientId,
                priority: input.priority ?? 'NORMAL',
                deadline: input.deadline ? new Date(input.deadline) : undefined,
                items: { create: input.items.map((i) => ({ productId: i.productId, qtyNeeded: i.qtyNeeded })) },
            },
            include: { items: true },
        });
        let totalPrice = 0;
        let needsPrice = false;
        let reservationError = null;
        for (const item of order.items) {
            try {
                await this.stockService.reserve({
                    productId: item.productId,
                    clientId: input.clientId,
                    qty: item.qtyNeeded,
                    orderId: order.id,
                });
            }
            catch {
                reservationError = 'Недостаточно доступного остатка для резервирования';
            }
            const priceResult = await this.pricingService.calculateForProduct(item.productId);
            if (priceResult.price === null) {
                needsPrice = true;
            }
            else {
                totalPrice += priceResult.price * item.qtyNeeded;
            }
        }
        let nextStatus = 'AWAITING_PROCESSING';
        if (reservationError)
            nextStatus = 'ERROR';
        else if (needsPrice)
            nextStatus = 'NEEDS_PRICE';
        else {
            const debtSummary = await this.debtsService.getSummary(input.clientId);
            if (debtSummary.state === 'BLOCKED')
                nextStatus = 'BLOCKED_DEBT';
        }
        await this.transitionStatus(order.id, nextStatus, null, {
            processingCost: needsPrice ? undefined : totalPrice,
        });
        return this.findOne(order.id);
    }
    async transitionStatus(orderId, status, userId, extra) {
        const order = await this.prisma.marketplaceOrder.findUnique({
            where: { id: orderId },
            include: { reservations: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Заказ не найден');
        if (!(0, order_funnel_1.isTransitionAllowed)(order.status, status)) {
            throw new common_1.BadRequestException(`Переход из статуса ${order.status} в ${status} запрещён бизнес-логикой`);
        }
        if (status === 'CANCELLED') {
            for (const r of order.reservations.filter((r) => !r.isReleased)) {
                await this.stockService.release(r.id);
            }
        }
        if (status === 'SHIPPED') {
            for (const r of order.reservations.filter((r) => !r.isReleased)) {
                await this.stockService.consumeReservation(r.id, userId, `FBS заказ №${order.orderNumber}`);
            }
            if (order.processingCost) {
                await this.debtsService.charge(order.clientId, Number(order.processingCost), 'Обработка FBS-заказа', order.orderNumber);
            }
        }
        const updated = await this.prisma.marketplaceOrder.update({
            where: { id: orderId },
            data: {
                status,
                ...(extra?.processingCost !== undefined && { processingCost: extra.processingCost }),
            },
        });
        await this.prisma.orderStatusHistory.create({
            data: { orderId, status, userId: userId ?? null },
        });
        this.eventsGateway.emitOrderUpdated({ orderId, status });
        return updated;
    }
    assign(orderId, assigneeId) {
        return this.prisma.marketplaceOrder.update({ where: { id: orderId }, data: { assigneeId } });
    }
    async pickableItems(clientId) {
        return this.prisma.orderItem.findMany({
            where: {
                order: { clientId, status: { in: ['AWAITING_PROCESSING', 'IN_PROGRESS', 'PICKING'] } },
                notFound: false,
            },
            include: { product: true, order: true },
        });
    }
    async scanPick(orderId, barcode, userId) {
        const order = await this.prisma.marketplaceOrder.findUnique({ where: { id: orderId }, include: { items: true } });
        if (!order)
            throw new common_1.NotFoundException('Заказ не найден');
        const item = await this.prisma.orderItem.findFirst({
            where: { orderId, product: { barcode } },
            include: { product: true },
        });
        if (!item) {
            throw new common_1.BadRequestException('Неверный товар: штрихкод не соответствует ни одной позиции заказа');
        }
        if (item.qtyPicked >= item.qtyNeeded) {
            throw new common_1.BadRequestException('Эта позиция уже полностью собрана');
        }
        const updatedItem = await this.prisma.orderItem.update({
            where: { id: item.id },
            data: { qtyPicked: { increment: 1 } },
        });
        if (order.status === 'AWAITING_PROCESSING' || order.status === 'IN_PROGRESS') {
            await this.transitionStatus(orderId, 'PICKING', userId);
        }
        const allItems = await this.prisma.orderItem.findMany({ where: { orderId } });
        const allPicked = allItems.every((i) => i.qtyPicked >= i.qtyNeeded);
        if (allPicked) {
            await this.transitionStatus(orderId, 'PICKED', userId);
        }
        return { item: updatedItem, allPicked };
    }
    async markItemNotFound(orderId, itemId, userId) {
        const item = await this.prisma.orderItem.update({ where: { id: itemId }, data: { notFound: true } });
        const order = await this.prisma.marketplaceOrder.findUniqueOrThrow({ where: { id: orderId } });
        await this.notificationsService.create({
            clientId: order.clientId,
            type: 'ITEM_NOT_FOUND',
            title: 'Товар не найден при сборке',
            message: `Заказ №${order.orderNumber}: товар не найден на складе.`,
        });
        await this.transitionStatus(orderId, 'ITEM_NOT_FOUND', userId);
        return item;
    }
    async scanPack(orderId, barcode, userId) {
        const item = await this.prisma.orderItem.findFirst({
            where: { orderId, product: { barcode } },
        });
        if (!item) {
            throw new common_1.BadRequestException('Неверный товар: штрихкод не соответствует ни одной позиции заказа');
        }
        if (item.qtyPacked >= item.qtyPicked) {
            throw new common_1.BadRequestException('Эта позиция уже полностью упакована');
        }
        const updatedItem = await this.prisma.orderItem.update({
            where: { id: item.id },
            data: { qtyPacked: { increment: 1 } },
        });
        const order = await this.prisma.marketplaceOrder.findUniqueOrThrow({ where: { id: orderId } });
        if (order.status === 'PICKED') {
            await this.transitionStatus(orderId, 'PACKING', userId);
        }
        const allItems = await this.prisma.orderItem.findMany({ where: { orderId } });
        const allPacked = allItems.every((i) => i.qtyPacked >= i.qtyNeeded);
        if (allPacked) {
            await this.transitionStatus(orderId, 'PACKED', userId);
        }
        return { item: updatedItem, allPacked };
    }
    async setPackaging(orderId, packagingTypeId) {
        const updated = await this.prisma.marketplaceOrder.update({ where: { id: orderId }, data: { packagingTypeId } });
        if (updated.status === 'PACKED') {
            return this.transitionStatus(orderId, 'READY_TO_SHIP', null);
        }
        return updated;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stock_service_1.StockService,
        pricing_service_1.PricingService,
        debts_service_1.DebtsService,
        notifications_service_1.NotificationsService,
        events_gateway_1.EventsGateway])
], OrdersService);
//# sourceMappingURL=orders.service.js.map