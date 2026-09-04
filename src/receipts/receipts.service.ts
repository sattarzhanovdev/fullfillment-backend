import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';

export interface CreateReceiptInput {
  clientId: string;
  warehouseId: string;
  documentNumber?: string;
  expectedPlaces?: number;
  items: { productId: string; expectedQty: number }[];
}

@Injectable()
export class ReceiptsService {
  constructor(
    private prisma: PrismaService,
    private stockService: StockService,
  ) {}

  findAll(filters: { clientId?: string; status?: string }) {
    return this.prisma.receipt.findMany({
      where: {
        ...(filters.clientId && { clientId: filters.clientId }),
        ...(filters.status && { status: filters.status as any }),
      },
      include: { client: { select: { id: true, name: true } }, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: { client: true, warehouse: true, items: { include: { product: true } } },
    });
    if (!receipt) throw new NotFoundException('Приёмка не найдена');
    return receipt;
  }

  async create(input: CreateReceiptInput, userId?: string) {
    const expectedItems = input.items.reduce((sum, i) => sum + i.expectedQty, 0);
    return this.prisma.receipt.create({
      data: {
        clientId: input.clientId,
        warehouseId: input.warehouseId,
        documentNumber: input.documentNumber,
        expectedPlaces: input.expectedPlaces,
        expectedItems,
        createdById: userId,
        items: {
          create: input.items.map((i) => ({ productId: i.productId, expectedQty: i.expectedQty })),
        },
      },
      include: { items: { include: { product: true } } },
    });
  }

  /** Сканирование товара при приёмке: увеличивает факт. количество и физ. остаток (ТЗ §12). */
  async scanItem(receiptId: string, barcode: string, cellId: string, userId?: string) {
    const receipt = await this.prisma.receipt.findUnique({ where: { id: receiptId } });
    if (!receipt) throw new NotFoundException('Приёмка не найдена');

    const product = await this.prisma.product.findFirst({
      where: { barcode, clientId: receipt.clientId },
    });
    if (!product) {
      throw new BadRequestException('Товар с этим штрихкодом не найден у данного клиента');
    }

    let item = await this.prisma.receiptItem.findFirst({ where: { receiptId, productId: product.id } });
    if (!item) {
      item = await this.prisma.receiptItem.create({
        data: { receiptId, productId: product.id, expectedQty: 0, actualQty: 0 },
      });
    }

    const newActual = item.actualQty + 1;
    const updatedItem = await this.prisma.receiptItem.update({
      where: { id: item.id },
      data: { actualQty: newActual, discrepancy: newActual - item.expectedQty, cellId },
    });

    await this.stockService.adjustPhysical({
      productId: product.id,
      clientId: receipt.clientId,
      cellId,
      delta: 1,
      reason: 'Приёмка',
      reference: `Приёмка №${receipt.documentNumber ?? receipt.id}`,
      userId,
    });

    if (receipt.status === 'DRAFT') {
      await this.prisma.receipt.update({ where: { id: receiptId }, data: { status: 'IN_PROGRESS' } });
    }

    return { item: updatedItem, product };
  }

  async complete(id: string) {
    return this.prisma.receipt.update({ where: { id }, data: { status: 'COMPLETED' } });
  }
}
