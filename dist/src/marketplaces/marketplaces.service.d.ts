import { Marketplace } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WildberriesAdapter } from './adapters/wildberries.adapter';
import { OzonAdapter } from './adapters/ozon.adapter';
export declare class MarketplacesService {
    private prisma;
    private wbAdapter;
    private ozonAdapter;
    constructor(prisma: PrismaService, wbAdapter: WildberriesAdapter, ozonAdapter: OzonAdapter);
    private resolveAdapter;
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
    upsert(clientId: string, marketplace: Marketplace, data: {
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
}
