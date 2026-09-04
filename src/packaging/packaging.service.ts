import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PackagingService {
  constructor(private prisma: PrismaService) {}

  findAll(onlyActive = false) {
    return this.prisma.packagingType.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.packagingType.findUnique({ where: { id } });
  }

  create(data: {
    name: string;
    kind: string;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    weightKg?: number;
    cost?: number;
    maxVolumeL?: number;
  }) {
    return this.prisma.packagingType.create({ data });
  }

  update(id: string, data: Partial<Parameters<PackagingService['create']>[0]> & { isActive?: boolean }) {
    return this.prisma.packagingType.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.packagingType.update({ where: { id }, data: { isActive: false } });
  }
}
