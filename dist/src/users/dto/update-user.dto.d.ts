import { UserRole } from '@prisma/client';
export declare class UpdateUserDto {
    fullName?: string;
    role?: UserRole;
    isActive?: boolean;
    clientId?: string;
    password?: string;
}
