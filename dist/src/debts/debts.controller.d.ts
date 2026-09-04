import { DebtsService } from './debts.service';
export declare class DebtsController {
    private debtsService;
    constructor(debtsService: DebtsService);
    findAll(): Promise<{
        clientId: string;
        debt: number;
        inProgress: number;
        free: number;
        limit: number;
        percent: number;
        state: import("./debts.service").DebtState;
    }[]>;
    getSummary(clientId: string): Promise<{
        clientId: string;
        debt: number;
        inProgress: number;
        free: number;
        limit: number;
        percent: number;
        state: import("./debts.service").DebtState;
    }>;
    charge(clientId: string, body: {
        amount: number;
        reason: string;
        reference?: string;
    }): Promise<{
        id: string;
        clientId: string;
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        reason: string;
        reference: string | null;
    }>;
    pay(clientId: string, body: {
        amount: number;
        reason: string;
        reference?: string;
    }): Promise<{
        id: string;
        clientId: string;
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        reason: string;
        reference: string | null;
    }>;
}
