import { Injectable, NotFoundException } from '@nestjs/common';
import { Marketplace, ShipmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShipmentsService {
  constructor(private prisma: PrismaService) {}

  findAll(filters: { statuses?: ShipmentStatus[]; from?: string; to?: string }) {
    return this.prisma.shipment.findMany({
      where: {
        ...(filters.statuses && filters.statuses.length > 0 && { status: { in: filters.statuses } }),
        ...(filters.from && filters.to && { scheduledAt: { gte: new Date(filters.from), lte: new Date(filters.to) } }),
      },
      include: {
        warehouse: true,
        orders: { include: { client: { select: { id: true, name: true } } } },
        supplies: { include: { client: { select: { id: true, name: true } } } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        warehouse: true,
        orders: { include: { client: true, items: { include: { product: true } } } },
        supplies: { include: { client: true, items: { include: { product: true } } } },
      },
    });
    if (!shipment) throw new NotFoundException('Отгрузка не найдена');
    return shipment;
  }

  create(data: {
    marketplace?: Marketplace;
    warehouseId?: string;
    scheduledAt: string;
    transport?: string;
    driverName?: string;
  }) {
    return this.prisma.shipment.create({
      data: { ...data, scheduledAt: new Date(data.scheduledAt) },
    });
  }

  update(id: string, data: { transport?: string; driverName?: string; status?: ShipmentStatus; scheduledAt?: string }) {
    return this.prisma.shipment.update({
      where: { id },
      data: { ...data, ...(data.scheduledAt && { scheduledAt: new Date(data.scheduledAt) }) },
    });
  }

  async addOrder(shipmentId: string, orderId: string) {
    await this.prisma.marketplaceOrder.update({ where: { id: orderId }, data: { shipmentId } });
    return this.recalculateTotals(shipmentId);
  }

  async addSupply(shipmentId: string, supplyId: string) {
    await this.prisma.supply.update({ where: { id: supplyId }, data: { shipmentId } });
    return this.recalculateTotals(shipmentId);
  }

  async recalculateTotals(shipmentId: string) {
    const shipment = await this.findOne(shipmentId);
    let totalWeightKg = 0;
    let totalVolumeL = 0;
    let boxesCount = 0;

    for (const order of shipment.orders) {
      for (const item of order.items) {
        const w = item.product.weightKg ? Number(item.product.weightKg) : 0;
        const l = item.product.lengthCm ? Number(item.product.lengthCm) : 0;
        const wi = item.product.widthCm ? Number(item.product.widthCm) : 0;
        const h = item.product.heightCm ? Number(item.product.heightCm) : 0;
        totalWeightKg += w * item.qtyNeeded;
        totalVolumeL += ((l * wi * h) / 1000) * item.qtyNeeded;
      }
    }
    for (const supply of shipment.supplies) {
      boxesCount += supply.boxesCount ?? 0;
      for (const item of supply.items) {
        const w = item.product.weightKg ? Number(item.product.weightKg) : 0;
        totalWeightKg += w * item.qtyNeeded;
      }
    }

    return this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        totalWeightKg: Number(totalWeightKg.toFixed(2)),
        totalVolumeL: Number(totalVolumeL.toFixed(2)),
        boxesCount,
      },
    });
  }
}
