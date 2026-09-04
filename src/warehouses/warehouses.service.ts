import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  // ---- Warehouses ----
  findAllWarehouses() {
    return this.prisma.warehouse.findMany({
      include: { zones: { include: { cells: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findWarehouse(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: { zones: { include: { cells: true } } },
    });
    if (!warehouse) throw new NotFoundException('Склад не найден');
    return warehouse;
  }

  createWarehouse(data: { name: string; address?: string }) {
    return this.prisma.warehouse.create({ data });
  }

  updateWarehouse(id: string, data: { name?: string; address?: string; isActive?: boolean }) {
    return this.prisma.warehouse.update({ where: { id }, data });
  }

  // ---- Zones ----
  createZone(warehouseId: string, data: { code: string; name?: string; isReturns?: boolean }) {
    return this.prisma.zone.create({ data: { ...data, warehouseId } });
  }

  updateZone(id: string, data: { code?: string; name?: string; isReturns?: boolean }) {
    return this.prisma.zone.update({ where: { id }, data });
  }

  removeZone(id: string) {
    return this.prisma.zone.delete({ where: { id } });
  }

  // ---- Cells ----
  findCells(params: { zoneId?: string; warehouseId?: string }) {
    return this.prisma.cell.findMany({
      where: {
        ...(params.zoneId && { zoneId: params.zoneId }),
        ...(params.warehouseId && { zone: { warehouseId: params.warehouseId } }),
      },
      include: { zone: { include: { warehouse: true } } },
      orderBy: { code: 'asc' },
    });
  }

  async findCell(id: string) {
    const cell = await this.prisma.cell.findUnique({
      where: { id },
      include: { zone: { include: { warehouse: true } }, stocks: { include: { product: true, client: true } } },
    });
    if (!cell) throw new NotFoundException('Ячейка не найдена');
    return cell;
  }

  createCell(zoneId: string, data: { code: string; type?: any; capacity?: number }) {
    return this.prisma.cell.create({ data: { ...data, zoneId } });
  }

  updateCell(id: string, data: { code?: string; type?: any; capacity?: number; isActive?: boolean }) {
    return this.prisma.cell.update({ where: { id }, data });
  }

  removeCell(id: string) {
    return this.prisma.cell.delete({ where: { id } });
  }
}
