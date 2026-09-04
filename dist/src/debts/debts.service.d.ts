import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';
export type DebtState = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'BLOCKED';
export declare class DebtsService {
    private prisma;
    private notificationsService;
    private settingsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, settingsService: SettingsService);
    getBalance(clientId: string): Promise<number>;
    getActiveOperationsCost(clientId: string): Promise<number>;
    stateForPercent(percent: number): DebtState;
    getSummary(clientId: string): Promise<{
        clientId: string;
        debt: number;
        inProgress: number;
        free: number;
        limit: number;
        percent: number;
        state: DebtState;
    }>;
    findAllSummaries(): Promise<{
        clientId: string;
        debt: number;
        inProgress: number;
        free: number;
        limit: number;
        percent: number;
        state: DebtState;
    }[]>;
    charge(clientId: string, amount: number, reason: string, reference?: string): Promise<{
        id: string;
        clientId: string;
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        reason: string;
        reference: string | null;
    }>;
    pay(clientId: string, amount: number, reason: string, reference?: string): Promise<{
        id: string;
        clientId: string;
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        reason: string;
        reference: string | null;
    }>;
    private maybeNotifyThreshold;
    assertOperationAllowed(clientId: string, operation: 'receiving' | 'picking' | 'packing' | 'shipping'): Promise<void>;
}
