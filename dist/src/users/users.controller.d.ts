import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<{
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
    update(id: string, dto: UpdateUserDto): Promise<{
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
}
