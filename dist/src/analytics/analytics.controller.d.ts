import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    orders(from?: string, to?: string): Promise<{
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
    warehouse(): Promise<{
        totalPhysical: number;
        totalReserved: number;
        totalAvailable: number;
        lowStockCount: number;
        staleProductsCount: number;
    }>;
    finance(from?: string, to?: string): Promise<{
        charged: number;
        paid: number;
        currentDebt: number;
    }>;
    efficiency(from?: string, to?: string): Promise<{
        avgPickingMs: number;
        avgPackingMs: number;
        avgOrderToShipMs: number;
        itemNotFoundRatio: number;
    }>;
    kpi(from?: string, to?: string): Promise<{
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
    timeSeries(from?: string, to?: string, clientId?: string): Promise<{
        date: string;
        orders: number;
        revenue: number;
    }[]>;
    topProducts(from?: string, to?: string, limit?: string, clientId?: string): Promise<{
        productId: string;
        name: string;
        article: string;
        qty: number;
    }[]>;
    topClients(from?: string, to?: string, limit?: string): Promise<{
        name: string;
        clientId: string;
        revenue: number;
    }[]>;
    comparison(from?: string, to?: string): Promise<{
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
}
