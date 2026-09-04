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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../events/events.gateway");
let NotificationsService = class NotificationsService {
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    async create(input) {
        const notification = await this.prisma.notification.create({
            data: {
                userId: input.userId ?? null,
                clientId: input.clientId ?? null,
                type: input.type,
                title: input.title,
                message: input.message,
            },
        });
        this.eventsGateway.emitNotification({
            userId: input.userId,
            clientId: input.clientId,
            title: input.title,
            message: input.message,
            type: input.type,
        });
        return notification;
    }
    async findForUser(userId, clientId, take = 30) {
        return this.prisma.notification.findMany({
            where: {
                OR: [{ userId }, ...(clientId ? [{ clientId }] : [])],
            },
            orderBy: { createdAt: 'desc' },
            take,
        });
    }
    async markRead(id) {
        return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
    }
    async markAllRead(userId) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
    async unreadCount(userId, clientId) {
        return this.prisma.notification.count({
            where: {
                isRead: false,
                OR: [{ userId }, ...(clientId ? [{ clientId }] : [])],
            },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map