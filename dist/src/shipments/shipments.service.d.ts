import { Marketplace, ShipmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class ShipmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(filters: {
        statuses?: ShipmentStatus[];
        from?: string;
        to?: string;
    }): import(".prisma/client").Prisma.PrismaPromise<({
        orders: ({
            client: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.FunnelStatus;
            packagingTypeId: string | null;
            processingCost: import("@prisma/client/runtime/library").Decimal | null;
            deliveryCost: import("@prisma/client/runtime/library").Decimal | null;
            orderNumber: string;
            marketplace: import(".prisma/client").$Enums.Marketplace;
            shipmentRefNumber: string | null;
            priority: import(".prisma/client").$Enums.OrderPriority;
            assigneeId: string | null;
            deadline: Date | null;
            orderedAt: Date;
            shipmentId: string | null;
        })[];
        supplies: ({
            client: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SupplyStatus;
            marketplace: import(".prisma/client").$Enums.Marketplace;
            assigneeId: string | null;
            deadline: Date | null;
            shipmentId: string | null;
            boxesCount: number | null;
            supplyNumber: string;
            marketplaceWarehouse: string | null;
            palletsCount: number | null;
        })[];
        warehouse: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            name: string;
            address: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        warehouseId: string | null;
        marketplace: import(".prisma/client").$Enums.Marketplace | null;
        scheduledAt: Date;
        transport: string | null;
        driverName: string | null;
        boxesCount: number | null;
        totalWeightKg: import("@prisma/client/runtime/library").Decimal | null;
        totalVolumeL: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    findOne(id: string): Promise<{
        orders: ({
            client: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                type: import(".prisma/client").$Enums.ClientType;
                managerId: string | null;
                status: import(".prisma/client").$Enums.ClientStatus;
                debtLimit: import("@prisma/client/runtime/library").Decimal;
                bufferPercent: import("@prisma/client/runtime/library").Decimal | null;
            };
            items: ({
                product: {
                    id: string;
                    clientId: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    bufferPercent: import("@prisma/client/runtime/library").Decimal | null;
                    lengthCm: import("@prisma/client/runtime/library").Decimal | null;
                    widthCm: import("@prisma/client/runtime/library").Decimal | null;
                    heightCm: import("@prisma/client/runtime/library").Decimal | null;
                    weightKg: import("@prisma/client/runtime/library").Decimal | null;
                    sku: string;
                    article: string;
                    barcode: string;
                    category: string | null;
                    photoUrl: string | null;
                    packagingTypeId: string | null;
                    ownPrice: import("@prisma/client/runtime/library").Decimal | null;
                    fbsProcessingPrice: import("@prisma/client/runtime/library").Decimal | null;
                };
            } & {
                id: string;
                productId: string;
                cellId: string | null;
                orderId: string;
                qtyNeeded: number;
                qtyPicked: number;
                qtyPacked: number;
                notFound: boolean;
            })[];
        } & {
            id: string;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.FunnelStatus;
            packagingTypeId: string | null;
            processingCost: import("@prisma/client/runtime/library").Decimal | null;
            deliveryCost: import("@prisma/client/runtime/library").Decimal | null;
            orderNumber: string;
            marketplace: import(".prisma/client").$Enums.Marketplace;
            shipmentRefNumber: string | null;
            priority: import(".prisma/client").$Enums.OrderPriority;
            assigneeId: string | null;
            deadline: Date | null;
            orderedAt: Date;
            shipmentId: string | null;
        })[];
        supplies: ({
            client: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                type: import(".prisma/client").$Enums.ClientType;
                managerId: string | null;
                status: import(".prisma/client").$Enums.ClientStatus;
                debtLimit: import("@prisma/client/runtime/library").Decimal;
                bufferPercent: import("@prisma/client/runtime/library").Decimal | null;
            };
            items: ({
                product: {
                    id: string;
                    clientId: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    bufferPercent: import("@prisma/client/runtime/library").Decimal | null;
                    lengthCm: import("@prisma/client/runtime/library").Decimal | null;
                    widthCm: import("@prisma/client/runtime/library").Decimal | null;
                    heightCm: import("@prisma/client/runtime/library").Decimal | null;
                    weightKg: import("@prisma/client/runtime/library").Decimal | null;
                    sku: string;
                    article: string;
                    barcode: string;
                    category: string | null;
                    photoUrl: string | null;
                    packagingTypeId: string | null;
                    ownPrice: import("@prisma/client/runtime/library").Decimal | null;
                    fbsProcessingPrice: import("@prisma/client/runtime/library").Decimal | null;
                };
            } & {
                id: string;
                productId: string;
                supplyId: string;
                qtyNeeded: number;
                qtyPicked: number;
            })[];
        } & {
            id: string;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SupplyStatus;
            marketplace: import(".prisma/client").$Enums.Marketplace;
            assigneeId: string | null;
            deadline: Date | null;
            shipmentId: string | null;
            boxesCount: number | null;
            supplyNumber: string;
            marketplaceWarehouse: string | null;
            palletsCount: number | null;
        })[];
        warehouse: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            name: string;
            address: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        warehouseId: string | null;
        marketplace: import(".prisma/client").$Enums.Marketplace | null;
        scheduledAt: Date;
        transport: string | null;
        driverName: string | null;
        boxesCount: number | null;
        totalWeightKg: import("@prisma/client/runtime/library").Decimal | null;
        totalVolumeL: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    create(data: {
        marketplace?: Marketplace;
        warehouseId?: string;
        scheduledAt: string;
        transport?: string;
        driverName?: string;
    }): import(".prisma/client").Prisma.Prisma__ShipmentClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        warehouseId: string | null;
        marketplace: import(".prisma/client").$Enums.Marketplace | null;
        scheduledAt: Date;
        transport: string | null;
        driverName: string | null;
        boxesCount: number | null;
        totalWeightKg: import("@prisma/client/runtime/library").Decimal | null;
        totalVolumeL: import("@prisma/client/runtime/library").Decimal | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: {
        transport?: string;
        driverName?: string;
        status?: ShipmentStatus;
        scheduledAt?: string;
    }): import(".prisma/client").Prisma.Prisma__ShipmentClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        warehouseId: string | null;
        marketplace: import(".prisma/client").$Enums.Marketplace | null;
        scheduledAt: Date;
        transport: string | null;
        driverName: string | null;
        boxesCount: number | null;
        totalWeightKg: import("@prisma/client/runtime/library").Decimal | null;
        totalVolumeL: import("@prisma/client/runtime/library").Decimal | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    addOrder(shipmentId: string, orderId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        warehouseId: string | null;
        marketplace: import(".prisma/client").$Enums.Marketplace | null;
        scheduledAt: Date;
        transport: string | null;
        driverName: string | null;
        boxesCount: number | null;
        totalWeightKg: import("@prisma/client/runtime/library").Decimal | null;
        totalVolumeL: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    addSupply(shipmentId: string, supplyId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        warehouseId: string | null;
        marketplace: import(".prisma/client").$Enums.Marketplace | null;
        scheduledAt: Date;
        transport: string | null;
        driverName: string | null;
        boxesCount: number | null;
        totalWeightKg: import("@prisma/client/runtime/library").Decimal | null;
        totalVolumeL: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    recalculateTotals(shipmentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        warehouseId: string | null;
        marketplace: import(".prisma/client").$Enums.Marketplace | null;
        scheduledAt: Date;
        transport: string | null;
        driverName: string | null;
        boxesCount: number | null;
        totalWeightKg: import("@prisma/client/runtime/library").Decimal | null;
        totalVolumeL: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
