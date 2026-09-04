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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
const SAFE_SELECT = {
    id: true,
    email: true,
    fullName: true,
    role: true,
    clientId: true,
    isActive: true,
    twoFactorEnabled: true,
    lastLoginAt: true,
    createdAt: true,
};
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(input) {
        const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
        if (existing) {
            throw new common_1.ConflictException('Пользователь с таким email уже существует');
        }
        const passwordHash = await bcrypt.hash(input.password, 10);
        return this.prisma.user.create({
            data: {
                email: input.email,
                passwordHash,
                fullName: input.fullName,
                role: input.role,
                clientId: input.clientId ?? null,
            },
            select: SAFE_SELECT,
        });
    }
    async findAll() {
        return this.prisma.user.findMany({ select: SAFE_SELECT, orderBy: { createdAt: 'desc' } });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
        if (!user)
            throw new common_1.NotFoundException('Пользователь не найден');
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async update(id, input) {
        const data = { ...input };
        if (input.password) {
            data.passwordHash = await bcrypt.hash(input.password, 10);
            delete data.password;
        }
        return this.prisma.user.update({ where: { id }, data, select: SAFE_SELECT });
    }
    async remove(id) {
        return this.prisma.user.update({ where: { id }, data: { isActive: false }, select: SAFE_SELECT });
    }
    async setRefreshTokenHash(id, hash) {
        return this.prisma.user.update({ where: { id }, data: { refreshTokenHash: hash } });
    }
    async setLastLogin(id) {
        return this.prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
    }
    async setTwoFactorSecret(id, secret) {
        return this.prisma.user.update({ where: { id }, data: { twoFactorSecret: secret } });
    }
    async enableTwoFactor(id) {
        return this.prisma.user.update({ where: { id }, data: { twoFactorEnabled: true }, select: SAFE_SELECT });
    }
    async disableTwoFactor(id) {
        return this.prisma.user.update({
            where: { id },
            data: { twoFactorEnabled: false, twoFactorSecret: null },
            select: SAFE_SELECT,
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map