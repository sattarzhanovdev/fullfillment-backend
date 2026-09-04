import { Request, Response } from 'express';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, req: Request, res: Response): Promise<{
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
    } | {
        accessToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            clientId: string;
        };
    }>;
    refresh(req: Request, res: Response): Promise<{
        accessToken: string;
    }>;
    logout(user: AuthenticatedUser, res: Response): Promise<{
        success: boolean;
    }>;
    me(user: AuthenticatedUser): AuthenticatedUser;
    setupTwoFactor(user: AuthenticatedUser): Promise<{
        secret: any;
        qrCodeDataUrl: any;
    }>;
    enableTwoFactor(user: AuthenticatedUser, body: {
        secret: string;
        code: string;
    }): Promise<{
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
    disableTwoFactor(user: AuthenticatedUser): Promise<{
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
