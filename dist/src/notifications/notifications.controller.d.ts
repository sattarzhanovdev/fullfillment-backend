import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    findMine(user: AuthenticatedUser): Promise<{
        id: string;
        clientId: string | null;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string | null;
        title: string;
        message: string;
        isRead: boolean;
    }[]>;
    unreadCount(user: AuthenticatedUser): Promise<number>;
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
    markAllRead(user: AuthenticatedUser): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
