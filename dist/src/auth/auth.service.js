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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const users_service_1 = require("../users/users.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, configService, auditLogService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.auditLogService = auditLogService;
    }
    async login(email, password, twoFactorCode, meta) {
        const user = await this.usersService.findByEmail(email);
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Неверный email или пароль');
        }
        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Неверный email или пароль');
        }
        if (user.twoFactorEnabled) {
            if (!twoFactorCode) {
                return { requiresTwoFactor: true };
            }
            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: twoFactorCode,
                window: 1,
            });
            if (!verified) {
                throw new common_1.UnauthorizedException('Неверный код двухфакторной аутентификации');
            }
        }
        const tokens = await this.issueTokens({
            sub: user.id,
            email: user.email,
            role: user.role,
            clientId: user.clientId,
        });
        await this.usersService.setLastLogin(user.id);
        await this.auditLogService.log({
            userId: user.id,
            action: 'LOGIN',
            entityType: 'User',
            entityId: user.id,
            device: meta?.device,
            ip: meta?.ip,
        });
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                clientId: user.clientId,
            },
        };
    }
    async issueTokens(payload) {
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') ?? '15m',
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') ?? '7d',
        });
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        await this.usersService.setRefreshTokenHash(payload.sub, refreshTokenHash);
        return { accessToken, refreshToken };
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Недействительный refresh token');
        }
        const user = await this.usersService.findByEmail(payload.email);
        if (!user || !user.refreshTokenHash || !user.isActive) {
            throw new common_1.UnauthorizedException('Сессия недействительна');
        }
        const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!matches) {
            throw new common_1.UnauthorizedException('Сессия недействительна');
        }
        return this.issueTokens({
            sub: user.id,
            email: user.email,
            role: user.role,
            clientId: user.clientId,
        });
    }
    async logout(userId) {
        await this.usersService.setRefreshTokenHash(userId, null);
        return { success: true };
    }
    async setupTwoFactor(userId, email) {
        const secret = speakeasy.generateSecret({
            name: `WB Fulfillment (${email})`,
        });
        await this.usersService.setTwoFactorSecret(userId, secret.base32);
        const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
        return { secret: secret.base32, qrCodeDataUrl };
    }
    async confirmTwoFactor(userId, secret, code) {
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token: code,
            window: 1,
        });
        if (!verified) {
            throw new common_1.BadRequestException('Неверный код. Проверьте приложение-аутентификатор.');
        }
        return this.usersService.enableTwoFactor(userId);
    }
    async disableTwoFactor(userId) {
        return this.usersService.disableTwoFactor(userId);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        audit_log_service_1.AuditLogService])
], AuthService);
//# sourceMappingURL=auth.service.js.map