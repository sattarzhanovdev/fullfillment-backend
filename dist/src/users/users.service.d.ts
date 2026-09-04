import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export interface CreateUserInput {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    clientId?: string | null;
}
export interface UpdateUserInput {
    fullName?: string;
    role?: UserRole;
    isActive?: boolean;
    clientId?: string | null;
    password?: string;
}
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(input: CreateUserInput): Promise<{
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
    findAll(): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        clientId: string;
        isActive: boolean;
        twoFactorEnabled: boolean;
        lastLoginAt: Date;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
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
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        clientId: string | null;
        isActive: boolean;
        twoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        refreshTokenHash: string | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, input: UpdateUserInput): Promise<{
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
    remove(id: string): Promise<{
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
    setRefreshTokenHash(id: string, hash: string | null): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        clientId: string | null;
        isActive: boolean;
        twoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        refreshTokenHash: string | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    setLastLogin(id: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        clientId: string | null;
        isActive: boolean;
        twoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        refreshTokenHash: string | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    setTwoFactorSecret(id: string, secret: string | null): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        clientId: string | null;
        isActive: boolean;
        twoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        refreshTokenHash: string | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    enableTwoFactor(id: string): Promise<{
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
    disableTwoFactor(id: string): Promise<{
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
