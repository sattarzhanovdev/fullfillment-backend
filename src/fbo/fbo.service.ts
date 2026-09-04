import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Marketplace, SupplyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';
import { EventsGateway } from '../events/events.gateway';
import { isSupplyTransitionAllowed } from './supply-funnel';

export interface CreateSupplyInput {
  supplyNumber: string;
  clientId: string;
  marketplace: Marketplace;
  marketplaceWarehouse?: string;
  deadline?: string;
  items: { productId: string; qtyNeeded: number }[];
}

@Injectable()
export class FboService {
  constructor(
    private prisma: PrismaService,
    private stockService: StockService,
    private eventsGateway: EventsGateway,
  ) {}

  findAll(filters: { clientId?: string; statuses?: SupplyStatus[] }) {
    return this.prisma.supply.findMany({
      where: {
        ...(filters.clientId && { clientId: filters.clientId }),
        ...(filters.statuses && filters.statuses.length > 0 && { status: { in: filters.statuses } }),
      },
      include: {
        client: { select: { id: true, name: true } },
        items: { include: { product: true } },
        assignee: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const supply = await this.prisma.supply.findUnique({
      where: { id },
      include: {
        client: true,
        items: { include: { product: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!supply) throw new NotFoundException('Поставка не найдена');
    return supply;
  }

  async create(input: CreateSupplyInput) {
    const supply = await this.prisma.supply.create({
      data: {
        supplyNumber: input.supplyNumber,
        clientId: input.clientId,
        marketplace: input.marketplace,
        marketplaceWarehouse: input.marketplaceWarehouse,
        deadline: input.deadline ? new Date(input.deadline) : undefined,
        items: { create: input.items.map((i) => ({ productId: i.productId, qtyNeeded: i.qtyNeeded })) },
      },
      include: { items: true },
    });

    for (const item of supply.items) {
      try {
        await this.stockService.reserve({
          productId: item.productId,
          clientId: input.clientId,
          qty: item.qtyNeeded,
          supplyId: supply.id,
        });
      } catch {
        // недостаточно остатка — поставка остаётся в DRAFT, сотрудник должен скорректировать состав
      }
    }

    return this.findOne(supply.id);
  }

  async transitionStatus(id: string, status: SupplyStatus, userId?: string | null) {
    const supply = await this.prisma.supply.findUnique({ where: { id }, include: { reservations: true } });
    if (!supply) throw new NotFoundException('Поставка не найдена');

    if (!isSupplyTransitionAllowed(supply.status, status)) {
      throw new BadRequestException(`Переход из статуса ${supply.status} в ${status} запрещён бизнес-логикой`);
    }

    if (status === 'CANCELLED') {
      for (const r of supply.reservations.filter((r) => !r.isReleased)) {
        await this.stockService.release(r.id);
      }
    }

    if (status === 'SHIPPED') {
      for (const r of supply.reservations.filter((r) => !r.isReleased)) {
        await this.stockService.consumeReservation(r.id, userId, `FBO поставка №${supply.supplyNumber}`);
      }
    }

    const updated = await this.prisma.supply.update({ where: { id }, data: { status } });
    await this.prisma.supplyStatusHistory.create({ data: { supplyId: id, status, userId: userId ?? null } });
    this.eventsGateway.emitSupplyUpdated({ supplyId: id, status });
    return updated;
  }

  async scanPick(supplyId: string, barcode: string) {
    const item = await this.prisma.supplyItem.findFirst({ where: { supplyId, product: { barcode } } });
    if (!item) throw new BadRequestException('Товар не относится к этой поставке');
    if (item.qtyPicked >= item.qtyNeeded) throw new BadRequestException('Позиция уже полностью собрана');

    const updated = await this.prisma.supplyItem.update({
      where: { id: item.id },
      data: { qtyPicked: { increment: 1 } },
    });

    const supply = await this.prisma.supply.findUniqueOrThrow({ where: { id: supplyId } });
    if (supply.status === 'CREATED') {
      await this.transitionStatus(supplyId, 'PICKING');
    }
    const items = await this.prisma.supplyItem.findMany({ where: { supplyId } });
    if (items.every((i) => i.qtyPicked >= i.qtyNeeded)) {
      await this.transitionStatus(supplyId, 'PICKED');
    }
    return updated;
  }

  setBoxes(id: string, boxesCount: number, palletsCount?: number) {
    return this.prisma.supply.update({ where: { id }, data: { boxesCount, palletsCount } });
  }
}
