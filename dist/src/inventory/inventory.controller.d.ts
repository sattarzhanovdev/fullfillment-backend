import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private inventoryService;
    constructor(inventoryService: InventoryService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        client: {
            id: string;
            name: string;
        };
        _count: {
            lines: number;
        };
    } & {
        id: string;
        cellId: string | null;
        clientId: string | null;
        zoneId: string | null;
        warehouseId: string | null;
        createdAt: Date;
        status: string;
        scope: import(".prisma/client").$Enums.InventoryScope;
        createdById: string | null;
        completedAt: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        lines: {
            product: {
                id: string;
                clientId: string;
                updatedAt: Date;
                isActive: boolean;
                name: string;
                createdAt: Date;
                sku: string;
                article: string;
                barcode: string;
                category: string | null;
                photoUrl: string | null;
                lengthCm: import("@prisma/client/runtime/library").Decimal | null;
                widthCm: import("@prisma/client/runtime/library").Decimal | null;
                heightCm: import("@prisma/client/runtime/library").Decimal | null;
                weightKg: import("@prisma/client/runtime/library").Decimal | null;
                packagingTypeId: string | null;
                ownPrice: import("@prisma/client/runtime/library").Decimal | null;
                fbsProcessingPrice: import("@prisma/client/runtime/library").Decimal | null;
                bufferPercent: import("@prisma/client/runtime/library").Decimal | null;
            };
            id: string;
            productId: string;
            inventoryCountId: string;
            systemQty: number;
            actualQty: number | null;
            discrepancy: number | null;
        }[];
        client: {
            id: string;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ClientType;
            name: string;
            createdAt: Date;
            bufferPercent: import("@prisma/client/runtime/library").Decimal | null;
            managerId: string | null;
            status: import(".prisma/client").$Enums.ClientStatus;
            debtLimit: import("@prisma/client/runtime/library").Decimal;
        };
        id: string;
        cellId: string | null;
        clientId: string | null;
        zoneId: string | null;
        warehouseId: string | null;
        createdAt: Date;
        status: string;
        scope: import(".prisma/client").$Enums.InventoryScope;
        createdById: string | null;
        completedAt: Date | null;
    }>;
    create(body: any, user: AuthenticatedUser): Promise<{
        lines: {
            id: string;
            productId: string;
            inventoryCountId: string;
            systemQty: number;
            actualQty: number | null;
            discrepancy: number | null;
        }[];
    } & {
        id: string;
        cellId: string | null;
        clientId: string | null;
        zoneId: string | null;
        warehouseId: string | null;
        createdAt: Date;
        status: string;
        scope: import(".prisma/client").$Enums.InventoryScope;
        createdById: string | null;
        completedAt: Date | null;
    }>;
    scan(id: string, productId: string): Promise<{
        id: string;
        productId: string;
        inventoryCountId: string;
        systemQty: number;
        actualQty: number | null;
        discrepancy: number | null;
    }>;
    complete(id: string, user: AuthenticatedUser): Promise<{
        id: string;
        cellId: string | null;
        clientId: string | null;
        zoneId: string | null;
        warehouseId: string | null;
        createdAt: Date;
        status: string;
        scope: import(".prisma/client").$Enums.InventoryScope;
        createdById: string | null;
        completedAt: Date | null;
    }>;
}
