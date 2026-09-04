import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class TelegramService {
    private prisma;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
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
    upsertLink(clientId: string, data: Partial<{
        chatId: string;
        username: string;
        notifyNewOrder: boolean;
        notifyPicked: boolean;
        notifyPacked: boolean;
        notifyShipped: boolean;
        notifyLowStock: boolean;
        notifyDebt: boolean;
        notifyErrors: boolean;
    }>): import(".prisma/client").Prisma.Prisma__TelegramLinkClient<{
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
    notify(clientId: string, message: string): Promise<void>;
}
