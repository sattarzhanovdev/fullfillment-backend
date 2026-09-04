import { StockService } from './stock.service';
export declare class StockController {
    private stockService;
    constructor(stockService: StockService);
    findMany(clientId?: string, productId?: string, article?: string, barcode?: string, name?: string, warehouseId?: string, zoneId?: string, cellId?: string): Promise<{
        availableQty: number;
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
        cell: {
            zone: {
                warehouse: {
                    id: string;
                    isActive: boolean;
                    name: string;
                    address: string | null;
                    createdAt: Date;
                };
            } & {
                id: string;
                code: string;
                warehouseId: string;
                name: string | null;
                isReturns: boolean;
            };
        } & {
            id: string;
            zoneId: string;
            code: string;
            type: import(".prisma/client").$Enums.CellType;
            capacity: number | null;
            isActive: boolean;
        };
        client: {
            id: string;
            name: string;
        };
        id: string;
        productId: string;
        cellId: string;
        clientId: string;
        physicalQty: number;
        reservedQty: number;
        blockedQty: number;
        updatedAt: Date;
    }[]>;
    getTotals(productId: string): Promise<{
        physicalQty: number;
        reservedQty: number;
        blockedQty: number;
        availableQty: number;
    }>;
    getShowcase(productId: string): Promise<{
        bufferPercent: number;
        showcaseQty: number;
        physicalQty: number;
        reservedQty: number;
        blockedQty: number;
        availableQty: number;
    }>;
    previewBuffer(productId: string, bufferPercent: number): Promise<{
        before: number;
        after: number;
    }>;
}
