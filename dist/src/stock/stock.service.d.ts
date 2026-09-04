import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EventsGateway } from '../events/events.gateway';
import { SettingsService } from '../settings/settings.service';
import { NotificationsService } from '../notifications/notifications.service';
export interface StockFilters {
    clientId?: string;
    productId?: string;
    article?: string;
    barcode?: string;
    name?: string;
    warehouseId?: string;
    zoneId?: string;
    cellId?: string;
}
export interface AdjustPhysicalInput {
    productId: string;
    clientId: string;
    cellId: string;
    delta: number;
    reason: string;
    reference?: string;
    userId?: string | null;
}
export declare class StockService {
    private prisma;
    private auditLogService;
    private eventsGateway;
    private notificationsService;
    private settingsService?;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, eventsGateway: EventsGateway, notificationsService: NotificationsService, settingsService?: SettingsService);
    findMany(filters: StockFilters): Promise<{
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
    getTotalsForProduct(productId: string): Promise<{
        physicalQty: number;
        reservedQty: number;
        blockedQty: number;
        availableQty: number;
    }>;
    adjustPhysical(input: AdjustPhysicalInput): Promise<{
        id: string;
        productId: string;
        cellId: string;
        clientId: string;
        physicalQty: number;
        reservedQty: number;
        blockedQty: number;
        updatedAt: Date;
    }>;
    reserve(params: {
        productId: string;
        clientId: string;
        qty: number;
        orderId?: string;
        supplyId?: string;
    }): Promise<{
        id: string;
        productId: string;
        clientId: string;
        createdAt: Date;
        qty: number;
        isReleased: boolean;
        releasedAt: Date | null;
        orderId: string | null;
        supplyId: string | null;
    }>;
    release(reservationId: string): Promise<{
        id: string;
        productId: string;
        clientId: string;
        createdAt: Date;
        qty: number;
        isReleased: boolean;
        releasedAt: Date | null;
        orderId: string | null;
        supplyId: string | null;
    }>;
    consumeReservation(reservationId: string, userId?: string | null, reference?: string): Promise<{
        id: string;
        productId: string;
        clientId: string;
        createdAt: Date;
        qty: number;
        isReleased: boolean;
        releasedAt: Date | null;
        orderId: string | null;
        supplyId: string | null;
    }>;
    transferBetweenCells(params: {
        productId: string;
        clientId: string;
        fromCellId: string;
        toCellId: string;
        qty: number;
        userId?: string | null;
    }): Promise<{
        id: string;
        productId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.MovementStatus;
        qty: number;
        fromCellId: string;
        toCellId: string;
        userId: string | null;
    }>;
    resolveBufferPercent(productId: string): Promise<number>;
    showcaseQtyForProduct(productId: string): Promise<{
        bufferPercent: number;
        showcaseQty: number;
        physicalQty: number;
        reservedQty: number;
        blockedQty: number;
        availableQty: number;
    }>;
    previewBuffer(productId: string, newBufferPercent: number): Promise<{
        before: number;
        after: number;
    }>;
}
