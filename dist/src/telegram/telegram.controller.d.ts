import { TelegramService } from './telegram.service';
export declare class TelegramController {
    private telegramService;
    constructor(telegramService: TelegramService);
    getLink(clientId: string): import(".prisma/client").Prisma.Prisma__TelegramLinkClient<{
        id: string;
        clientId: string;
        createdAt: Date;
        chatId: string | null;
        username: string | null;
        notifyNewOrder: boolean;
        notifyPicked: boolean;
        notifyPacked: boolean;
        notifyShipped: boolean;
        notifyLowStock: boolean;
        notifyDebt: boolean;
        notifyErrors: boolean;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    upsertLink(clientId: string, body: any): import(".prisma/client").Prisma.Prisma__TelegramLinkClient<{
        id: string;
        clientId: string;
        createdAt: Date;
        chatId: string | null;
        username: string | null;
        notifyNewOrder: boolean;
        notifyPicked: boolean;
        notifyPacked: boolean;
        notifyShipped: boolean;
        notifyLowStock: boolean;
        notifyDebt: boolean;
        notifyErrors: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
