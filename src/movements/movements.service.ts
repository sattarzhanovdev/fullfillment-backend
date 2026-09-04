import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';

export interface CreateMovementInput {
  productId: string;
  clientId: string;
  fromCellId: string;
  toCellId: string;
  qty: number;
  userId?: string | null;
}

@Injectable()
export class MovementsService {
  constructor(
    private prisma: PrismaService,
    private stockService: StockService,
  ) {}

  create(input: CreateMovementInput) {
    return this.stockService.transferBetweenCells(input);
  }

  findAll(params: { productId?: string; cellId?: string; take?: number }) {
    return this.prisma.movement.findMany({
      where: {
        ...(params.productId && { productId: params.productId }),
        ...(params.cellId && { OR: [{ fromCellId: params.cellId }, { toCellId: params.cellId }] }),
      },
      include: {
        product: true,
        fromCell: { include: { zone: true } },
        toCell: { include: { zone: true } },
        user: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: params.take ?? 100,
    });
  }
}
