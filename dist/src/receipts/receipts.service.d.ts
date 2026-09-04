import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';
export interface CreateReceiptInput {
    clientId: string;
    warehouseId: string;
    documentNumber?: string;
    expectedPlaces?: number;
    items: {
        productId: string;
        expectedQty: number;
    }[];
}
export declare class ReceiptsService {
    private prisma;
    private stockService;
    constructor(prisma: PrismaService, stockService: StockService);
    findAll(filters: {
        clientId?: string;
        status?: string;
    }): import(".prisma/client").Prisma.PrismaPromise<({
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
    create(input: CreateReceiptInput, userId?: string): Promise<{
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
    scanItem(receiptId: string, barcode: string, cellId: string, userId?: string): Promise<{
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
