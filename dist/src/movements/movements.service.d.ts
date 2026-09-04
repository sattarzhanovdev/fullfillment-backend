import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';
export interface CreateMovementInput {
    productId: string;
    clientId: string;
    fromCellId: string;
    toCellId: string;
    qty: number;
    userId?: string | null;
}
export declare class MovementsService {
    private prisma;
    private stockService;
    constructor(prisma: PrismaService, stockService: StockService);
    create(input: CreateMovementInput): Promise<{
        id: string;
        productId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.MovementStatus;
        qty: number;
        fromCellId: string;
        toCellId: string;
        userId: string | null;
    }>;
    findAll(params: {
        productId?: string;
        cellId?: string;
        take?: number;
    }): import(".prisma/client").Prisma.PrismaPromise<({
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
        user: {
            id: string;
            fullName: string;
        };
        fromCell: {
            zone: {
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
        toCell: {
            zone: {
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
    } & {
        id: string;
        productId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.MovementStatus;
        qty: number;
        fromCellId: string;
        toCellId: string;
        userId: string | null;
    })[]>;
}
