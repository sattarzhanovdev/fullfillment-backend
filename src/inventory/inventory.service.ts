import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryScope } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';

export interface CreateInventoryInput {
  scope: InventoryScope;
  warehouseId?: string;
  clientId?: string;
  zoneId?: string;
  cellId?: string;
  productIds?: string[];
}

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private stockService: StockService,
  ) {}

  findAll() {
    return this.prisma.inventoryCount.findMany({
      include: { client: { select: { id: true, name: true } }, _count: { select: { lines: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const count = await this.prisma.inventoryCount.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!count) throw new NotFoundException('Инвентаризация не найдена');
    const lines = await this.prisma.inventoryLine.findMany({ where: { inventoryCountId: id } });
    const productIds = lines.map((l) => l.productId);
    const products = await this.prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));
    return { ...count, lines: lines.map((l) => ({ ...l, product: productMap.get(l.productId) })) };
  }

  async create(input: CreateInventoryInput, userId?: string) {
    const stockWhere: any = {
      ...(input.clientId && { clientId: input.clientId }),
      ...(input.cellId && { cellId: input.cellId }),
      cell: {
        ...(input.zoneId && { zoneId: input.zoneId }),
        ...(input.warehouseId && { zone: { warehouseId: input.warehouseId } }),
      },
      ...(input.productIds && input.productIds.length > 0 && { productId: { in: input.productIds } }),
    };

    const stocks = await this.prisma.stock.findMany({ where: stockWhere });

    const byProduct = new Map<string, number>();
    for (const s of stocks) {
      byProduct.set(s.productId, (byProduct.get(s.productId) ?? 0) + s.physicalQty);
    }

    return this.prisma.inventoryCount.create({
      data: {
        scope: input.scope,
        warehouseId: input.warehouseId,
        clientId: input.clientId,
        zoneId: input.zoneId,
        cellId: input.cellId,
        createdById: userId,
        lines: {
          create: Array.from(byProduct.entries()).map(([productId, systemQty]) => ({
            productId,
            systemQty,
          })),
        },
      },
      include: { lines: true },
    });
}

  /** Сканирование товара в рамках инвентаризации — увеличивает фактическое количество строки. */
  async scanLine(inventoryCountId: string, productId: string) {
    let line = await this.prisma.inventoryLine.findFirst({ where: { inventoryCountId, productId } });
    if (!line) {
      line = await this.prisma.inventoryLine.create({
        data: { inventoryCountId, productId, systemQty: 0, actualQty: 0 },
      });
    }
    const actualQty = (line.actualQty ?? 0) + 1;
    return this.prisma.inventoryLine.update({
      where: { id: line.id },
      data: { actualQty, discrepancy: actualQty - line.systemQty },
    });
  }

  /** Завершение инвентаризации: расхождения списываются/начисляются в физический остаток. */
  async complete(id: string, userId?: string) {
    const count = await this.prisma.inventoryCount.findUnique({ where: { id }, include: { lines: true } });
    if (!count) throw new NotFoundException('Инвентаризация не найдена');

    for (const line of count.lines) {
      if (line.actualQty === null) continue;
      const discrepancy = line.actualQty - line.systemQty;
      if (discrepancy === 0) continue;

      const targetStock = await this.prisma.stock.findFirst({
        where: {
          productId: line.productId,
          ...(count.clientId && { clientId: count.clientId }),
          ...(count.cellId && { cellId: count.cellId }),
        },
        orderBy: { physicalQty: 'desc' },
      });
      if (!targetStock) continue;

      await this.stockService.adjustPhysical({
        productId: line.productId,
        clientId: targetStock.clientId,
        cellId: targetStock.cellId,
        delta: discrepancy,
        reason: 'Инвентаризация',
        reference: `Инвентаризация №${count.id}`,
        userId,
      });
    }

    return this.prisma.inventoryCount.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date() },
    });
  }
}
