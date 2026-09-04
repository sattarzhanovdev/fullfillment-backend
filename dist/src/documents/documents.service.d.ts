import { DocumentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findForClient(clientId: string, type?: DocumentType): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        clientId: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.DocumentType;
        title: string;
        fileUrl: string;
    }[]>;
    create(data: {
        clientId: string;
        type: DocumentType;
        title: string;
        fileUrl: string;
    }): import(".prisma/client").Prisma.Prisma__DocumentClient<{
        id: string;
        clientId: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.DocumentType;
        title: string;
        fileUrl: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__DocumentClient<{
        id: string;
        clientId: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.DocumentType;
        title: string;
        fileUrl: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
