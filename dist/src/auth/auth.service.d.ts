import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AuditLogService } from '../audit-log/audit-log.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    private auditLogService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, auditLogService: AuditLogService);
    login(email: string, password: string, twoFactorCode?: string, meta?: {
        ip?: string;
        device?: string;
    }): Promise<{
        requiresTwoFactor: boolean;
    } | {
        user: {
            id: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            clientId: string;
        };
        accessToken: string;
        refreshToken: string;
        requiresTwoFactor?: undefined;
    }>;
    private issueTokens;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        success: boolean;
    }>;
    setupTwoFactor(userId: string, email: string): Promise<{
        secret: any;
        qrCodeDataUrl: any;
    }>;
    confirmTwoFactor(userId: string, secret: string, code: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        clientId: string;
        isActive: boolean;
        twoFactorEnabled: boolean;
        lastLoginAt: Date;
        createdAt: Date;
    }>;
    disableTwoFactor(userId: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        clientId: string;
        isActive: boolean;
        twoFactorEnabled: boolean;
        lastLoginAt: Date;
        createdAt: Date;
    }>;
}
