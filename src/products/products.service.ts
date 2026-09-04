import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';

export interface ProductFilters {
  clientId?: string;
  search?: string;
}

function withVolume<T extends { lengthCm?: any; widthCm?: any; heightCm?: any }>(product: T) {
  const l = product.lengthCm ? Number(product.lengthCm) : null;
  const w = product.widthCm ? Number(product.widthCm) : null;
  const h = product.heightCm ? Number(product.heightCm) : null;
  const volumeLiters = l && w && h ? Number(((l * w * h) / 1000).toFixed(3)) : null;
  return { ...product, volumeLiters };
}

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private stockService: StockService,
  ) {}

  async findAll(filters: ProductFilters) {
    const products = await this.prisma.product.findMany({
      where: {
        ...(filters.clientId && { clientId: filters.clientId }),
        ...(filters.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { article: { contains: filters.search, mode: 'insensitive' } },
            { barcode: { contains: filters.search } },
            { sku: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
      },
      include: { client: { select: { id: true, name: true } }, packagingType: true },
      orderBy: { createdAt: 'desc' },
    });
    return products.map(withVolume);
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { client: true, packagingType: true },
    });
    if (!product) throw new NotFoundException('Товар не найден');
    const totals = await this.stockService.getTotalsForProduct(id);
    return { ...withVolume(product), stock: totals };
  }

  async history(id: string) {
    return this.prisma.productHistoryEntry.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  create(data: {
    clientId: string;
    name: string;
    sku: string;
    article: string;
    barcode: string;
    category?: string;
    photoUrl?: string;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    weightKg?: number;
    packagingTypeId?: string;
    ownPrice?: number;
    fbsProcessingPrice?: number;
    bufferPercent?: number;
  }) {
    return this.prisma.product.create({ data });
  }

  update(id: string, data: Partial<Parameters<ProductsService['create']>[0]>) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  findByBarcode(barcode: string, clientId?: string) {
    return this.prisma.product.findFirst({
      where: { barcode, ...(clientId && { clientId }) },
    });
  }
}
