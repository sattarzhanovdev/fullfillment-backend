import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { ReceiptsService } from './receipts.service';
export declare class ReceiptsController {
    private receiptsService;
    constructor(receiptsService: ReceiptsService);
    findAll(clientId?: string, status?: string): import(".prisma/client").Prisma.PrismaPromise<({
        client: {
            id: string;
            name: string;
        };
        items: {
            id: string;
            productId: string;
            cellId: string | null;
            actualQty: number;
            discrepancy: number;
            receiptId: string;
            expectedQty: number;
        }[];
    } & {
        id: string;
        clientId: string;
        updatedAt: Date;
        warehouseId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ReceiptStatus;
        createdById: string | null;
        documentNumber: string | null;
        date: Date;
        expectedPlaces: number | null;
        expectedItems: number | null;
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
        warehouse: {
            id: string;
            isActive: boolean;
            name: string;
            address: string | null;
            createdAt: Date;
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
            cellId: string | null;
            actualQty: number;
            discrepancy: number;
            receiptId: string;
            expectedQty: number;
        })[];
    } & {
        id: string;
        clientId: string;
        updatedAt: Date;
        warehouseId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ReceiptStatus;
        createdById: string | null;
        documentNumber: string | null;
        date: Date;
        expectedPlaces: number | null;
        expectedItems: number | null;
    }>;
    create(body: any, user: AuthenticatedUser): Promise<{
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
            cellId: string | null;
            actualQty: number;
            discrepancy: number;
            receiptId: string;
            expectedQty: number;
        })[];
    } & {
        id: string;
        clientId: string;
        updatedAt: Date;
        warehouseId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ReceiptStatus;
        createdById: string | null;
        documentNumber: string | null;
        date: Date;
        expectedPlaces: number | null;
        expectedItems: number | null;
    }>;
    scan(id: string, body: {
        barcode: string;
        cellId: string;
    }, user: AuthenticatedUser): Promise<{
        item: {
            id: string;
            productId: string;
            cellId: string | null;
            actualQty: number;
            discrepancy: number;
            receiptId: string;
            expectedQty: number;
        };
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
    }>;
    complete(id: string): Promise<{
        id: string;
        clientId: string;
        updatedAt: Date;
        warehouseId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ReceiptStatus;
        createdById: string | null;
        documentNumber: string | null;
        date: Date;
        expectedPlaces: number | null;
        expectedItems: number | null;
    }>;
}
