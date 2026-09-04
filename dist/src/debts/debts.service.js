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
exports.DebtsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const settings_service_1 = require("../settings/settings.service");
let DebtsService = class DebtsService {
    constructor(prisma, notificationsService, settingsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.settingsService = settingsService;
    }
    async getBalance(clientId) {
        const agg = await this.prisma.debtLedgerEntry.aggregate({
            where: { clientId },
            _sum: { amount: true },
        });
        return Number(agg._sum.amount ?? 0);
    }
    async getActiveOperationsCost(clientId) {
        const agg = await this.prisma.marketplaceOrder.aggregate({
            where: {
                clientId,
                status: { in: ['PICKING', 'PACKING', 'READY_TO_SHIP', 'AWAITING_PROCESSING', 'IN_PROGRESS'] },
            },
            _sum: { processingCost: true },
        });
        return Number(agg._sum.processingCost ?? 0);
    }
    stateForPercent(percent) {
        if (percent >= 100)
            return 'BLOCKED';
        if (percent >= 80)
            return 'CRITICAL';
        if (percent >= 50)
            return 'WARNING';
        return 'NORMAL';
    }
    async getSummary(clientId) {
        const client = await this.prisma.client.findUniqueOrThrow({ where: { id: clientId } });
        const debt = await this.getBalance(clientId);
        const inProgress = await this.getActiveOperationsCost(clientId);
        const limit = Number(client.debtLimit);
        const percent = limit > 0 ? ((debt + inProgress) / limit) * 100 : 0;
        const state = this.stateForPercent(percent);
        const free = Math.max(0, limit - debt - inProgress);
        return { clientId, debt, inProgress, free, limit, percent: Number(percent.toFixed(1)), state };
    }
    async findAllSummaries() {
        const clients = await this.prisma.client.findMany({ where: { status: 'ACTIVE' } });
        return Promise.all(clients.map((c) => this.getSummary(c.id)));
    }
    async charge(clientId, amount, reason, reference) {
        const entry = await this.prisma.debtLedgerEntry.create({
            data: { clientId, amount, reason, reference },
        });
        await this.maybeNotifyThreshold(clientId);
        return entry;
    }
    async pay(clientId, amount, reason, reference) {
        return this.prisma.debtLedgerEntry.create({
            data: { clientId, amount: -Math.abs(amount), reason, reference },
        });
    }
    async maybeNotifyThreshold(clientId) {
        const summary = await this.getSummary(clientId);
        if (summary.state === 'CRITICAL' || summary.state === 'BLOCKED') {
            await this.notificationsService.create({
                clientId,
                type: summary.state === 'BLOCKED' ? 'LIMIT_EXCEEDED' : 'DEBT',
                title: summary.state === 'BLOCKED' ? 'Превышен лимит задолженности' : 'Критический уровень задолженности',
                message: `Задолженность клиента достигла ${summary.percent}% от лимита (${summary.debt} ₽ из ${summary.limit} ₽).`,
            });
        }
    }
    async assertOperationAllowed(clientId, operation) {
        const summary = await this.getSummary(clientId);
        if (summary.state !== 'BLOCKED')
            return;
        const blockedOps = await this.settingsService.get(settings_service_1.SETTING_KEYS.DEBT_BLOCKED_OPERATIONS);
        if (blockedOps?.includes(operation)) {
            throw new common_1.ForbiddenException(`Клиент заблокирован: превышен лимит задолженности (${summary.debt} ₽ из ${summary.limit} ₽)`);
        }
    }
};
exports.DebtsService = DebtsService;
exports.DebtsService = DebtsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        settings_service_1.SettingsService])
], DebtsService);
//# sourceMappingURL=debts.service.js.map