import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(): Promise<{
        totalClients: number;
        activeClients: number;
        totalProducts: number;
        totalStockUnits: number;
        ordersToday: number;
        ordersPicking: number;
        ordersPacked: number;
        ordersAwaitingShipment: number;
        shippedToday: number;
        fbsOrdersCount: number;
        fboSuppliesCount: number;
        revenueDay: number;
        revenueMonth: number;
        totalDebt: number;
        blockedDebtOrders: number;
        needsPriceOrders: number;
        productsWithoutDimensions: number;
        criticalStockCount: number;
    }>;
    getTrend(days?: string): Promise<{
        date: string;
        orders: number;
        revenue: number;
    }[]>;
    getAttention(): Promise<({
        client: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        clientId: string;
        createdAt: Date;
        orderNumber: string;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        shipmentRefNumber: string | null;
        status: import(".prisma/client").$Enums.FunnelStatus;
        priority: import(".prisma/client").$Enums.OrderPriority;
        assigneeId: string | null;
        processingCost: import("@prisma/client/runtime/library").Decimal | null;
        deliveryCost: import("@prisma/client/runtime/library").Decimal | null;
        packagingTypeId: string | null;
        deadline: Date | null;
        orderedAt: Date;
        updatedAt: Date;
        shipmentId: string | null;
    })[]>;
    getLowStock(): Promise<{
        available: number;
        product: {
            client: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            clientId: string;
            createdAt: Date;
            heightCm: import("@prisma/client/runtime/library").Decimal | null;
            widthCm: import("@prisma/client/runtime/library").Decimal | null;
            lengthCm: import("@prisma/client/runtime/library").Decimal | null;
            packagingTypeId: string | null;
            updatedAt: Date;
            name: string;
            bufferPercent: import("@prisma/client/runtime/library").Decimal | null;
            sku: string;
            article: string;
            barcode: string;
            category: string | null;
            photoUrl: string | null;
            weightKg: import("@prisma/client/runtime/library").Decimal | null;
            ownPrice: import("@prisma/client/runtime/library").Decimal | null;
            fbsProcessingPrice: import("@prisma/client/runtime/library").Decimal | null;
            isActive: boolean;
        };
    }[]>;
    getRecentOrders(): Promise<({
        client: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        clientId: string;
        createdAt: Date;
        orderNumber: string;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        shipmentRefNumber: string | null;
        status: import(".prisma/client").$Enums.FunnelStatus;
        priority: import(".prisma/client").$Enums.OrderPriority;
        assigneeId: string | null;
        processingCost: import("@prisma/client/runtime/library").Decimal | null;
        deliveryCost: import("@prisma/client/runtime/library").Decimal | null;
        packagingTypeId: string | null;
        deadline: Date | null;
        orderedAt: Date;
        updatedAt: Date;
        shipmentId: string | null;
    })[]>;
    getUpcomingShipments(): Promise<({
        _count: {
            orders: number;
            supplies: number;
        };
    } & {
        id: string;
        createdAt: Date;
        marketplace: import(".prisma/client").$Enums.Marketplace | null;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        updatedAt: Date;
        warehouseId: string | null;
        scheduledAt: Date;
        transport: string | null;
        driverName: string | null;
        boxesCount: number | null;
        totalWeightKg: import("@prisma/client/runtime/library").Decimal | null;
        totalVolumeL: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
}
