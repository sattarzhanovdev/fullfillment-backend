import { PrismaService } from '../prisma/prisma.service';
export declare const SETTING_KEYS: {
    readonly GENERAL_BUFFER_PERCENT: "general_buffer_percent";
    readonly GENERAL_DEBT_LIMIT: "general_debt_limit";
    readonly DEBT_BLOCKED_OPERATIONS: "debt_blocked_operations";
    readonly COMPANY_NAME: "company_name";
};
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    get<T = unknown>(key: string): Promise<T>;
    set(key: string, value: unknown): Promise<{
        updatedAt: Date;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getAll(): Promise<{
        [x: string]: unknown;
    }>;
}
