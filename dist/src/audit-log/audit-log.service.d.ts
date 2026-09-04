import { PrismaService } from '../prisma/prisma.service';
export interface AuditLogInput {
    userId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    oldValue?: unknown;
    newValue?: unknown;
    device?: string | null;
    ip?: string | null;
}
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(input: AuditLogInput): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string | null;
        oldValue: import("@prisma/client/runtime/library").JsonValue | null;
        newValue: import("@prisma/client/runtime/library").JsonValue | null;
        device: string | null;
        ip: string | null;
        userId: string | null;
    }>;
    findAll(params: {
        entityType?: string;
        entityId?: string;
        userId?: string;
        take?: number;
        skip?: number;
    }): Promise<({
        user: {
            id: string;
            email: string;
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string | null;
        oldValue: import("@prisma/client/runtime/library").JsonValue | null;
        newValue: import("@prisma/client/runtime/library").JsonValue | null;
        device: string | null;
        ip: string | null;
        userId: string | null;
    })[]>;
}
