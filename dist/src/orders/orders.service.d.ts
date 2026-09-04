import { FunnelStatus, Marketplace } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';
import { PricingService } from '../pricing/pricing.service';
import { DebtsService } from '../debts/debts.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';
export interface CreateOrderInput {
    orderNumber: string;
    marketplace: Marketplace;
    clientId: string;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    deadline?: string;
    items: {
        productId: string;
        qtyNeeded: number;
    }[];
}
export declare class OrdersService {
    private prisma;
    private stockService;
    private pricingService;
    private debtsService;
    private notificationsService;
    private eventsGateway;
    constructor(prisma: PrismaService, stockService: StockService, pricingService: PricingService, debtsService: DebtsService, notificationsService: NotificationsService, eventsGateway: EventsGateway);
    findAll(filters: {
        clientId?: string;
        statuses?: FunnelStatus[];
        marketplace?: Marketplace;
    }): import(".prisma/client").Prisma.PrismaPromise<({
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
            cellId: string | null;
            orderId: string;
            qtyNeeded: number;
            qtyPicked: number;
            qtyPacked: number;
            notFound: boolean;
        })[];
    } & {
        id: string;
        clientId: string;
        updatedAt: Date;
        createdAt: Date;
        packagingTypeId: string | null;
        status: import(".prisma/client").$Enums.FunnelStatus;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        assigneeId: string | null;
        deadline: Date | null;
        shipmentId: string | null;
        orderNumber: string;
        shipmentRefNumber: string | null;
        priority: import(".prisma/client").$Enums.OrderPriority;
        processingCost: import("@prisma/client/runtime/library").Decimal | null;
        deliveryCost: import("@prisma/client/runtime/library").Decimal | null;
        orderedAt: Date;
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
        packagingType: {
            id: string;
            isActive: boolean;
            name: string;
            lengthCm: import("@prisma/client/runtime/library").Decimal | null;
            widthCm: import("@prisma/client/runtime/library").Decimal | null;
            heightCm: import("@prisma/client/runtime/library").Decimal | null;
            weightKg: import("@prisma/client/runtime/library").Decimal | null;
            kind: string;
            cost: import("@prisma/client/runtime/library").Decimal;
            maxVolumeL: import("@prisma/client/runtime/library").Decimal | null;
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
            cellId: string | null;
            orderId: string;
            qtyNeeded: number;
            qtyPicked: number;
            qtyPacked: number;
            notFound: boolean;
        })[];
        statusHistory: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.FunnelStatus;
            orderId: string;
            userId: string | null;
        }[];
    } & {
        id: string;
        clientId: string;
        updatedAt: Date;
        createdAt: Date;
        packagingTypeId: string | null;
        status: import(".prisma/client").$Enums.FunnelStatus;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        assigneeId: string | null;
        deadline: Date | null;
        shipmentId: string | null;
        orderNumber: string;
        shipmentRefNumber: string | null;
        priority: import(".prisma/client").$Enums.OrderPriority;
        processingCost: import("@prisma/client/runtime/library").Decimal | null;
        deliveryCost: import("@prisma/client/runtime/library").Decimal | null;
        orderedAt: Date;
    }>;
    create(input: CreateOrderInput): Promise<{
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
        packagingType: {
            id: string;
            isActive: boolean;
            name: string;
            lengthCm: import("@prisma/client/runtime/library").Decimal | null;
            widthCm: import("@prisma/client/runtime/library").Decimal | null;
            heightCm: import("@prisma/client/runtime/library").Decimal | null;
            weightKg: import("@prisma/client/runtime/library").Decimal | null;
            kind: string;
            cost: import("@prisma/client/runtime/library").Decimal;
            maxVolumeL: import("@prisma/client/runtime/library").Decimal | null;
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
            cellId: string | null;
            orderId: string;
            qtyNeeded: number;
            qtyPicked: number;
            qtyPacked: number;
            notFound: boolean;
        })[];
        statusHistory: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.FunnelStatus;
            orderId: string;
            userId: string | null;
        }[];
    } & {
        id: string;
        clientId: string;
        updatedAt: Date;
        createdAt: Date;
        packagingTypeId: string | null;
        status: import(".prisma/client").$Enums.FunnelStatus;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        assigneeId: string | null;
        deadline: Date | null;
        shipmentId: string | null;
        orderNumber: string;
        shipmentRefNumber: string | null;
        priority: import(".prisma/client").$Enums.OrderPriority;
        processingCost: import("@prisma/client/runtime/library").Decimal | null;
        deliveryCost: import("@prisma/client/runtime/library").Decimal | null;
        orderedAt: Date;
    }>;
    transitionStatus(orderId: string, status: FunnelStatus, userId?: string | null, extra?: {
        processingCost?: number;
    }): Promise<{
        id: string;
        clientId: string;
        updatedAt: Date;
        createdAt: Date;
        packagingTypeId: string | null;
        status: import(".prisma/client").$Enums.FunnelStatus;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        assigneeId: string | null;
        deadline: Date | null;
        shipmentId: string | null;
        orderNumber: string;
        shipmentRefNumber: string | null;
        priority: import(".prisma/client").$Enums.OrderPriority;
        processingCost: import("@prisma/client/runtime/library").Decimal | null;
        deliveryCost: import("@prisma/client/runtime/library").Decimal | null;
        orderedAt: Date;
    }>;
    assign(orderId: string, assigneeId: string): import(".prisma/client").Prisma.Prisma__MarketplaceOrderClient<{
        id: string;
        clientId: string;
        updatedAt: Date;
        createdAt: Date;
        packagingTypeId: string | null;
        status: import(".prisma/client").$Enums.FunnelStatus;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        assigneeId: string | null;
        deadline: Date | null;
        shipmentId: string | null;
        orderNumber: string;
        shipmentRefNumber: string | null;
        priority: import(".prisma/client").$Enums.OrderPriority;
        processingCost: import("@prisma/client/runtime/library").Decimal | null;
        deliveryCost: import("@prisma/client/runtime/library").Decimal | null;
        orderedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    pickableItems(clientId: string): Promise<({
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
        order: {
            id: string;
            clientId: string;
            updatedAt: Date;
            createdAt: Date;
            packagingTypeId: string | null;
            status: import(".prisma/client").$Enums.FunnelStatus;
            marketplace: import(".prisma/client").$Enums.Marketplace;
            assigneeId: string | null;
            deadline: Date | null;
            shipmentId: string | null;
            orderNumber: string;
            shipmentRefNumber: string | null;
            priority: import(".prisma/client").$Enums.OrderPriority;
            processingCost: import("@prisma/client/runtime/library").Decimal | null;
            deliveryCost: import("@prisma/client/runtime/library").Decimal | null;
            orderedAt: Date;
        };
    } & {
        id: string;
        productId: string;
        cellId: string | null;
        orderId: string;
        qtyNeeded: number;
        qtyPicked: number;
        qtyPacked: number;
        notFound: boolean;
    })[]>;
    scanPick(orderId: string, barcode: string, userId?: string): Promise<{
        item: {
            id: string;
            productId: string;
            cellId: string | null;
            orderId: string;
            qtyNeeded: number;
            qtyPicked: number;
            qtyPacked: number;
            notFound: boolean;
        };
        allPicked: boolean;
    }>;
    markItemNotFound(orderId: string, itemId: string, userId?: string): Promise<{
        id: string;
        productId: string;
        cellId: string | null;
        orderId: string;
        qtyNeeded: number;
        qtyPicked: number;
        qtyPacked: number;
        notFound: boolean;
    }>;
    scanPack(orderId: string, barcode: string, userId?: string): Promise<{
        item: {
            id: string;
            productId: string;
            cellId: string | null;
            orderId: string;
            qtyNeeded: number;
            qtyPicked: number;
            qtyPacked: number;
            notFound: boolean;
        };
        allPacked: boolean;
    }>;
    setPackaging(orderId: string, packagingTypeId: string): Promise<{
        id: string;
        clientId: string;
        updatedAt: Date;
        createdAt: Date;
        packagingTypeId: string | null;
        status: import(".prisma/client").$Enums.FunnelStatus;
        marketplace: import(".prisma/client").$Enums.Marketplace;
        assigneeId: string | null;
        deadline: Date | null;
        shipmentId: string | null;
        orderNumber: string;
        shipmentRefNumber: string | null;
        priority: import(".prisma/client").$Enums.OrderPriority;
        processingCost: import("@prisma/client/runtime/library").Decimal | null;
        deliveryCost: import("@prisma/client/runtime/library").Decimal | null;
        orderedAt: Date;
    }>;
}
