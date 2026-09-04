import { SupplyStatus } from '@prisma/client';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { FboService } from './fbo.service';
export declare class FboController {
    private fboService;
    constructor(fboService: FboService);
    findAll(clientId?: string, status?: string): import(".prisma/client").Prisma.PrismaPromise<({
        client: {
            id: string;
            name: string;
        };
        assignee: {
            id: string;
            fullName: string;
        };
        items: ({
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
        updatedAt: Date;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SupplyStatus;
        supplyNumber: string;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        marketplaceWarehouse: string | null;
        assigneeId: string | null;
        deadline: Date | null;
        boxesCount: number | null;
        palletsCount: number | null;
        shipmentId: string | null;
    })[]>;
    findOne(id: string): Promise<{
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
        items: ({
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
        } & {
            id: string;
            productId: string;
            supplyId: string;
            qtyNeeded: number;
            qtyPicked: number;
        })[];
        statusHistory: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.SupplyStatus;
            supplyId: string;
            userId: string | null;
        }[];
    } & {
        id: string;
        clientId: string;
        updatedAt: Date;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SupplyStatus;
        supplyNumber: string;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        marketplaceWarehouse: string | null;
        assigneeId: string | null;
        deadline: Date | null;
        boxesCount: number | null;
        palletsCount: number | null;
        shipmentId: string | null;
    }>;
    create(body: any): Promise<{
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
        items: ({
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
        } & {
            id: string;
            productId: string;
            supplyId: string;
            qtyNeeded: number;
            qtyPicked: number;
        })[];
        statusHistory: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.SupplyStatus;
            supplyId: string;
            userId: string | null;
        }[];
    } & {
        id: string;
        clientId: string;
        updatedAt: Date;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SupplyStatus;
        supplyNumber: string;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        marketplaceWarehouse: string | null;
        assigneeId: string | null;
        deadline: Date | null;
        boxesCount: number | null;
        palletsCount: number | null;
        shipmentId: string | null;
    }>;
    updateStatus(id: string, status: SupplyStatus, user: AuthenticatedUser): Promise<{
        id: string;
        clientId: string;
        updatedAt: Date;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SupplyStatus;
        supplyNumber: string;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        marketplaceWarehouse: string | null;
        assigneeId: string | null;
        deadline: Date | null;
        boxesCount: number | null;
        palletsCount: number | null;
        shipmentId: string | null;
    }>;
    scanPick(id: string, barcode: string): Promise<{
        id: string;
        productId: string;
        supplyId: string;
        qtyNeeded: number;
        qtyPicked: number;
    }>;
    setBoxes(id: string, body: {
        boxesCount: number;
        palletsCount?: number;
    }): import(".prisma/client").Prisma.Prisma__SupplyClient<{
        id: string;
        clientId: string;
        updatedAt: Date;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SupplyStatus;
        supplyNumber: string;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        marketplaceWarehouse: string | null;
        assigneeId: string | null;
        deadline: Date | null;
        boxesCount: number | null;
        palletsCount: number | null;
        shipmentId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
