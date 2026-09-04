import { PackagingService } from './packaging.service';
export declare class PackagingController {
    private packagingService;
    constructor(packagingService: PackagingService);
    findAll(activeOnly?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        isActive: boolean;
        name: string;
        kind: string;
        lengthCm: import("@prisma/client/runtime/library").Decimal | null;
        widthCm: import("@prisma/client/runtime/library").Decimal | null;
        heightCm: import("@prisma/client/runtime/library").Decimal | null;
        weightKg: import("@prisma/client/runtime/library").Decimal | null;
        cost: import("@prisma/client/runtime/library").Decimal;
        maxVolumeL: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__PackagingTypeClient<{
        id: string;
        isActive: boolean;
        name: string;
        kind: string;
        lengthCm: import("@prisma/client/runtime/library").Decimal | null;
        widthCm: import("@prisma/client/runtime/library").Decimal | null;
        heightCm: import("@prisma/client/runtime/library").Decimal | null;
        weightKg: import("@prisma/client/runtime/library").Decimal | null;
        cost: import("@prisma/client/runtime/library").Decimal;
        maxVolumeL: import("@prisma/client/runtime/library").Decimal | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    create(body: any): import(".prisma/client").Prisma.Prisma__PackagingTypeClient<{
        id: string;
        isActive: boolean;
        name: string;
        kind: string;
        lengthCm: import("@prisma/client/runtime/library").Decimal | null;
        widthCm: import("@prisma/client/runtime/library").Decimal | null;
        heightCm: import("@prisma/client/runtime/library").Decimal | null;
        weightKg: import("@prisma/client/runtime/library").Decimal | null;
        cost: import("@prisma/client/runtime/library").Decimal;
        maxVolumeL: import("@prisma/client/runtime/library").Decimal | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, body: any): import(".prisma/client").Prisma.Prisma__PackagingTypeClient<{
        id: string;
        isActive: boolean;
        name: string;
        kind: string;
        lengthCm: import("@prisma/client/runtime/library").Decimal | null;
        widthCm: import("@prisma/client/runtime/library").Decimal | null;
        heightCm: import("@prisma/client/runtime/library").Decimal | null;
        weightKg: import("@prisma/client/runtime/library").Decimal | null;
        cost: import("@prisma/client/runtime/library").Decimal;
        maxVolumeL: import("@prisma/client/runtime/library").Decimal | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__PackagingTypeClient<{
        id: string;
        isActive: boolean;
        name: string;
        kind: string;
        lengthCm: import("@prisma/client/runtime/library").Decimal | null;
        widthCm: import("@prisma/client/runtime/library").Decimal | null;
        heightCm: import("@prisma/client/runtime/library").Decimal | null;
        weightKg: import("@prisma/client/runtime/library").Decimal | null;
        cost: import("@prisma/client/runtime/library").Decimal;
        maxVolumeL: import("@prisma/client/runtime/library").Decimal | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
