import { Marketplace } from '@prisma/client';
import { MarketplacesService } from './marketplaces.service';
export declare class MarketplacesController {
    private marketplacesService;
    private readonly logger;
    constructor(marketplacesService: MarketplacesService);
    findForClient(clientId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.IntegrationStatus;
        warehouseId: string | null;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        apiKey: string | null;
        marketplaceId: string | null;
        lastSyncAt: Date | null;
    }[]>;
    upsert(clientId: string, marketplace: Marketplace, body: {
        apiKey?: string;
        warehouseId?: string;
        marketplaceId?: string;
    }): Promise<{
        id: string;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.IntegrationStatus;
        warehouseId: string | null;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        apiKey: string | null;
        marketplaceId: string | null;
        lastSyncAt: Date | null;
    }>;
    sync(integrationId: string): Promise<{
        id: string;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.IntegrationStatus;
        warehouseId: string | null;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        apiKey: string | null;
        marketplaceId: string | null;
        lastSyncAt: Date | null;
    }>;
    handleWebhook(event: string, payload: unknown): {
        received: boolean;
    };
}
