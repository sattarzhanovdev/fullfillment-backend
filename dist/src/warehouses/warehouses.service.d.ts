import { PrismaService } from '../prisma/prisma.service';
export declare class WarehousesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllWarehouses(): import(".prisma/client").Prisma.PrismaPromise<({
        zones: ({
            cells: {
                id: string;
                isActive: boolean;
                type: import(".prisma/client").$Enums.CellType;
                code: string;
                zoneId: string;
                capacity: number | null;
            }[];
        } & {
            id: string;
            name: string | null;
            warehouseId: string;
            code: string;
            isReturns: boolean;
        })[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        address: string | null;
    })[]>;
    findWarehouse(id: string): Promise<{
        zones: ({
            cells: {
                id: string;
                isActive: boolean;
                type: import(".prisma/client").$Enums.CellType;
                code: string;
                zoneId: string;
                capacity: number | null;
            }[];
        } & {
            id: string;
            name: string | null;
            warehouseId: string;
            code: string;
            isReturns: boolean;
        })[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        address: string | null;
    }>;
    createWarehouse(data: {
        name: string;
        address?: string;
    }): import(".prisma/client").Prisma.Prisma__WarehouseClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        address: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updateWarehouse(id: string, data: {
        name?: string;
        address?: string;
        isActive?: boolean;
    }): import(".prisma/client").Prisma.Prisma__WarehouseClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        address: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    createZone(warehouseId: string, data: {
        code: string;
        name?: string;
        isReturns?: boolean;
    }): import(".prisma/client").Prisma.Prisma__ZoneClient<{
        id: string;
        name: string | null;
        warehouseId: string;
        code: string;
        isReturns: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updateZone(id: string, data: {
        code?: string;
        name?: string;
        isReturns?: boolean;
    }): import(".prisma/client").Prisma.Prisma__ZoneClient<{
        id: string;
        name: string | null;
        warehouseId: string;
        code: string;
        isReturns: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    removeZone(id: string): import(".prisma/client").Prisma.Prisma__ZoneClient<{
        id: string;
        name: string | null;
        warehouseId: string;
        code: string;
        isReturns: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findCells(params: {
        zoneId?: string;
        warehouseId?: string;
    }): import(".prisma/client").Prisma.PrismaPromise<({
        zone: {
            warehouse: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                name: string;
                address: string | null;
            };
        } & {
            id: string;
            name: string | null;
            warehouseId: string;
            code: string;
            isReturns: boolean;
        };
    } & {
        id: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.CellType;
        code: string;
        zoneId: string;
        capacity: number | null;
    })[]>;
    findCell(id: string): Promise<{
        stocks: ({
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
            clientId: string;
            updatedAt: Date;
            productId: string;
            cellId: string;
            physicalQty: number;
            reservedQty: number;
            blockedQty: number;
        })[];
        zone: {
            warehouse: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                name: string;
                address: string | null;
            };
        } & {
            id: string;
            name: string | null;
            warehouseId: string;
            code: string;
            isReturns: boolean;
        };
    } & {
        id: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.CellType;
        code: string;
        zoneId: string;
        capacity: number | null;
    }>;
    createCell(zoneId: string, data: {
        code: string;
        type?: any;
        capacity?: number;
    }): import(".prisma/client").Prisma.Prisma__CellClient<{
        id: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.CellType;
        code: string;
        zoneId: string;
        capacity: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updateCell(id: string, data: {
        code?: string;
        type?: any;
        capacity?: number;
        isActive?: boolean;
    }): import(".prisma/client").Prisma.Prisma__CellClient<{
        id: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.CellType;
        code: string;
        zoneId: string;
        capacity: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    removeCell(id: string): import(".prisma/client").Prisma.Prisma__CellClient<{
        id: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.CellType;
        code: string;
        zoneId: string;
        capacity: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
