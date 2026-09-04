import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
export interface CreateNotificationInput {
    userId?: string | null;
    clientId?: string | null;
    type: NotificationType;
    title: string;
    message: string;
}
export declare class NotificationsService {
    private prisma;
    private eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    create(input: CreateNotificationInput): Promise<{
        id: string;
        clientId: string | null;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string | null;
        title: string;
        message: string;
        isRead: boolean;
    }>;
    findForUser(userId: string, clientId: string | null, take?: number): Promise<{
        id: string;
        clientId: string | null;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string | null;
        title: string;
        message: string;
        isRead: boolean;
    }[]>;
    markRead(id: string): Promise<{
        id: string;
        clientId: string | null;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string | null;
        title: string;
        message: string;
        isRead: boolean;
    }>;
    markAllRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    unreadCount(userId: string, clientId: string | null): Promise<number>;
}
