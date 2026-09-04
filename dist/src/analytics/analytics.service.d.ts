import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    ordersReport(from: Date, to: Date): Promise<{
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.MarketplaceOrderGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        byMarketplace: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.MarketplaceOrderGroupByOutputType, "marketplace"[]> & {
            _count: number;
        })[];
        byClient: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.MarketplaceOrderGroupByOutputType, "clientId"[]> & {
            _count: number;
        })[];
    }>;
    timeSeries(from: Date, to: Date, clientId?: string): Promise<{
        date: string;
        orders: number;
        revenue: number;
    }[]>;
    topProducts(from: Date, to: Date, limit?: number, clientId?: string): Promise<{
        productId: string;
        name: string;
        article: string;
        qty: number;
    }[]>;
    topClients(from: Date, to: Date, limit?: number): Promise<{
        name: string;
        clientId: string;
        revenue: number;
    }[]>;
    periodComparison(from: Date, to: Date): Promise<{
        current: {
            from: Date;
            to: Date;
            revenue: number;
            orders: number;
        };
        previous: {
            from: Date;
            to: Date;
            revenue: number;
            orders: number;
        };
        change: {
            revenuePct: number;
            ordersPct: number;
        };
    }>;
    warehouseReport(): Promise<{
        totalPhysical: number;
        totalReserved: number;
        totalAvailable: number;
        lowStockCount: number;
        staleProductsCount: number;
    }>;
    financeReport(from: Date, to: Date): Promise<{
        charged: number;
        paid: number;
        currentDebt: number;
    }>;
    operationalEfficiency(from: Date, to: Date): Promise<{
        avgPickingMs: number;
        avgPackingMs: number;
        avgOrderToShipMs: number;
        itemNotFoundRatio: number;
    }>;
    employeeKpi(from: Date, to: Date): Promise<{
        ordersPickedByUser: {
            [k: string]: number;
        };
        ordersPackedByUser: {
            [k: string]: number;
        };
        receiptsByUser: {
            [k: string]: number;
        };
    }>;
}
