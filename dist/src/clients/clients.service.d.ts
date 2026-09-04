import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';
export declare class ClientsService {
    private prisma;
    private analyticsService;
    constructor(prisma: PrismaService, analyticsService: AnalyticsService);
    findAll(): Promise<{
        productsCount: number;
        ordersCount: number;
        debt: number;
        manager: {
            id: string;
            fullName: string;
        };
        _count: {
            products: number;
            orders: number;
        };
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.ClientType;
        managerId: string | null;
        status: import(".prisma/client").$Enums.ClientStatus;
        debtLimit: import("@prisma/client/runtime/library").Decimal;
        bufferPercent: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        manager: {
            id: string;
            fullName: string;
        };
        requisites: {
            id: string;
            updatedAt: Date;
            email: string | null;
            clientId: string;
            legalName: string;
            inn: string;
            ogrn: string | null;
            legalAddress: string | null;
            actualAddress: string | null;
            phone: string | null;
            bankName: string | null;
            bankAccount: string | null;
            bankBik: string | null;
            contactPerson: string | null;
        };
        contract: {
            number: string;
            id: string;
            status: import(".prisma/client").$Enums.ContractStatus;
            createdAt: Date;
            updatedAt: Date;
            clientId: string;
            date: Date;
            startDate: Date;
            termMonths: number | null;
            tariff: string | null;
            terms: string | null;
        };
        clientPrice: {
            id: string;
            updatedAt: Date;
            clientId: string;
            flatPrice: import("@prisma/client/runtime/library").Decimal | null;
            firstLiterPrice: import("@prisma/client/runtime/library").Decimal | null;
            nextLiterPrice: import("@prisma/client/runtime/library").Decimal | null;
        };
        marketplaceLinks: {
            id: string;
            status: import(".prisma/client").$Enums.IntegrationStatus;
            createdAt: Date;
            updatedAt: Date;
            clientId: string;
            marketplace: import(".prisma/client").$Enums.Marketplace;
            apiKey: string | null;
            warehouseId: string | null;
            marketplaceId: string | null;
            lastSyncAt: Date | null;
        }[];
        telegramLink: {
            id: string;
            createdAt: Date;
            clientId: string;
            chatId: string | null;
            username: string | null;
            notifyNewOrder: boolean;
            notifyPicked: boolean;
            notifyPacked: boolean;
            notifyShipped: boolean;
            notifyLowStock: boolean;
            notifyDebt: boolean;
            notifyErrors: boolean;
        };
    } & {
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.ClientType;
        managerId: string | null;
        status: import(".prisma/client").$Enums.ClientStatus;
        debtLimit: import("@prisma/client/runtime/library").Decimal;
        bufferPercent: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(data: {
        name: string;
        type?: 'IP' | 'OOO';
        managerId?: string;
        debtLimit?: number;
        bufferPercent?: number;
    }): import(".prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.ClientType;
        managerId: string | null;
        status: import(".prisma/client").$Enums.ClientStatus;
        debtLimit: import("@prisma/client/runtime/library").Decimal;
        bufferPercent: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: Partial<Parameters<ClientsService['create']>[0]> & {
        status?: any;
    }): import(".prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.ClientType;
        managerId: string | null;
        status: import(".prisma/client").$Enums.ClientStatus;
        debtLimit: import("@prisma/client/runtime/library").Decimal;
        bufferPercent: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.ClientType;
        managerId: string | null;
        status: import(".prisma/client").$Enums.ClientStatus;
        debtLimit: import("@prisma/client/runtime/library").Decimal;
        bufferPercent: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    upsertRequisites(clientId: string, data: {
        legalName: string;
        inn: string;
        ogrn?: string;
        legalAddress?: string;
        actualAddress?: string;
        phone?: string;
        email?: string;
        bankName?: string;
        bankAccount?: string;
        bankBik?: string;
        contactPerson?: string;
    }): import(".prisma/client").Prisma.Prisma__ClientRequisitesClient<{
        id: string;
        updatedAt: Date;
        email: string | null;
        clientId: string;
        legalName: string;
        inn: string;
        ogrn: string | null;
        legalAddress: string | null;
        actualAddress: string | null;
        phone: string | null;
        bankName: string | null;
        bankAccount: string | null;
        bankBik: string | null;
        contactPerson: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    upsertContract(clientId: string, data: {
        number: string;
        date: string;
        startDate: string;
        termMonths?: number;
        tariff?: string;
        terms?: string;
        status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
    }): import(".prisma/client").Prisma.Prisma__ContractClient<{
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.ContractStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        date: Date;
        startDate: Date;
        termMonths: number | null;
        tariff: string | null;
        terms: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    analytics(clientId: string, period?: {
        from?: string;
        to?: string;
    }): Promise<{
        period: {
            from: Date;
            to: Date;
        };
        ordersCount: number;
        fbsCount: number;
        fboCount: number;
        revenue: number;
        debt: number;
        timeSeries: {
            date: string;
            orders: number;
            revenue: number;
        }[];
        topProducts: {
            productId: string;
            name: string;
            article: string;
            qty: number;
        }[];
    }>;
}
