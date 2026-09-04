import { PricingService } from './pricing.service';
export declare class PricingController {
    private pricingService;
    constructor(pricingService: PricingService);
    getGeneral(): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        firstLiterPrice: import("@prisma/client/runtime/library").Decimal;
        nextLiterPrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    setGeneral(body: {
        firstLiterPrice: number;
        nextLiterPrice: number;
    }): Promise<{
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
    setClientPrice(clientId: string, body: {
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
    calculateForProduct(productId: string): Promise<import("./pricing.service").PriceResult>;
    needsPriceQueue(): Promise<{
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
        result: import("./pricing.service").PriceResult;
    }[]>;
}
