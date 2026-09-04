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
exports.SettingsService = exports.SETTING_KEYS = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
exports.SETTING_KEYS = {
    GENERAL_BUFFER_PERCENT: 'general_buffer_percent',
    GENERAL_DEBT_LIMIT: 'general_debt_limit',
    DEBT_BLOCKED_OPERATIONS: 'debt_blocked_operations',
    COMPANY_NAME: 'company_name',
};
const DEFAULTS = {
    [exports.SETTING_KEYS.GENERAL_BUFFER_PERCENT]: 0,
    [exports.SETTING_KEYS.GENERAL_DEBT_LIMIT]: 10000,
    [exports.SETTING_KEYS.DEBT_BLOCKED_OPERATIONS]: ['picking', 'packing', 'shipping'],
    [exports.SETTING_KEYS.COMPANY_NAME]: 'Fulfillment Center',
};
let SettingsService = class SettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get(key) {
        const row = await this.prisma.setting.findUnique({ where: { key } });
        return (row ? row.value : DEFAULTS[key]);
    }
    async set(key, value) {
        return this.prisma.setting.upsert({
            where: { key },
            create: { key, value: value },
            update: { value: value },
        });
    }
    async getAll() {
        const rows = await this.prisma.setting.findMany();
        const map = { ...DEFAULTS };
        for (const row of rows)
            map[row.key] = row.value;
        return map;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map