import { DocumentType } from '@prisma/client';
import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private documentsService;
    constructor(documentsService: DocumentsService);
    findForClient(clientId: string, type?: DocumentType): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        clientId: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.DocumentType;
        title: string;
        fileUrl: string;
    }[]>;
    upload(clientId: string, type: DocumentType, title: string, file: Express.Multer.File): import(".prisma/client").Prisma.Prisma__DocumentClient<{
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
