import { PrismaService } from '../prisma/prisma.service';
export declare class PackagingService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(onlyActive?: boolean): import(".prisma/client").Prisma.PrismaPromise<{
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
    create(data: {
        name: string;
        kind: string;
        lengthCm?: number;
        widthCm?: number;
        heightCm?: number;
        weightKg?: number;
        cost?: number;
        maxVolumeL?: number;
    }): import(".prisma/client").Prisma.Prisma__PackagingTypeClient<{
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
    update(id: string, data: Partial<Parameters<PackagingService['create']>[0]> & {
        isActive?: boolean;
    }): import(".prisma/client").Prisma.Prisma__PackagingTypeClient<{
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
