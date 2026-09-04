import { PrismaService } from '../prisma/prisma.service';
export type PriceSource = 'PRODUCT' | 'CLIENT_FLAT' | 'CLIENT_FORMULA' | 'GENERAL' | 'NEEDS_PRICE';
export interface PriceResult {
    price: number | null;
    source: PriceSource;
    reason?: string;
    liters?: number;
}
export declare class PricingService {
    private prisma;
    constructor(prisma: PrismaService);
    computeLiters(lengthCm?: number | null, widthCm?: number | null, heightCm?: number | null): number | null;
    priceByLiters(liters: number, firstLiterPrice: number, nextLiterPrice: number): number;
    getGeneralRule(): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        firstLiterPrice: import("@prisma/client/runtime/library").Decimal;
        nextLiterPrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    setGeneralRule(firstLiterPrice: number, nextLiterPrice: number): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        firstLiterPrice: import("@prisma/client/runtime/library").Decimal;
        nextLiterPrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    getClientPrice(clientId: string): Promise<{
        id: string;
        clientId: string;
        updatedAt: Date;
        firstLiterPrice: import("@prisma/client/runtime/library").Decimal | null;
        nextLiterPrice: import("@prisma/client/runtime/library").Decimal | null;
        flatPrice: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    setClientPrice(clientId: string, data: {
        flatPrice?: number | null;
        firstLiterPrice?: number | null;
        nextLiterPrice?: number | null;
    }): Promise<{
        id: string;
        clientId: string;
        updatedAt: Date;
        firstLiterPrice: import("@prisma/client/runtime/library").Decimal | null;
        nextLiterPrice: import("@prisma/client/runtime/library").Decimal | null;
        flatPrice: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    calculateForProduct(productId: string): Promise<PriceResult>;
    findNeedsPriceQueue(): Promise<{
        product: {
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
        } & {
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
        result: PriceResult;
    }[]>;
}
