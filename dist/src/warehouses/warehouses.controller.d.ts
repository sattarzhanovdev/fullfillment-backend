import { WarehousesService } from './warehouses.service';
export declare class WarehousesController {
    private warehousesService;
    constructor(warehousesService: WarehousesService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
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
    findOne(id: string): Promise<{
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
    create(body: {
        name: string;
        address?: string;
    }): import(".prisma/client").Prisma.Prisma__WarehouseClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        address: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, body: any): import(".prisma/client").Prisma.Prisma__WarehouseClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        address: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    createZone(id: string, body: {
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
    updateZone(zoneId: string, body: any): import(".prisma/client").Prisma.Prisma__ZoneClient<{
        id: string;
        name: string | null;
        warehouseId: string;
        code: string;
        isReturns: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findCells(zoneId?: string, warehouseId?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    findCell(cellId: string): Promise<{
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
    createCell(zoneId: string, body: {
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
    updateCell(cellId: string, body: any): import(".prisma/client").Prisma.Prisma__CellClient<{
        id: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.CellType;
        code: string;
        zoneId: string;
        capacity: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
