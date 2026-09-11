import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ShipmentStatus, UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { ShipmentsService } from './shipments.service';

@Controller('shipments')
export class ShipmentsController {
  constructor(private shipmentsService: ShipmentsService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('from') from?: string, @Query('to') to?: string) {
    const statuses = status ? (status.split(',') as ShipmentStatus[]) : undefined;
    return this.shipmentsService.findAll({ statuses, from, to });
  }

  @Get('by-barcode/:barcode')
  findByBarcode(@Param('barcode') barcode: string) {
    return this.shipmentsService.findByBarcode(barcode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shipmentsService.findOne(id);
  }

  @Get(':id/wb-barcode')
  getWbBarcode(@Param('id') id: string) {
    return this.shipmentsService.getWbBarcode(id);
  }

  @Get(':id/wb-shipping-points')
  getShippingPoints(@Param('id') id: string, @Query('city') city: string, @Query('cargoType') cargoType?: string) {
    const parsed = cargoType ? (Number(cargoType) as 1 | 2 | 3) : 1;
    return this.shipmentsService.getShippingPoints(id, city, parsed);
  }

  @Patch(':id/wb-shipping-method')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  setShippingMethod(
    @Param('id') id: string,
    @Body('shippingPointId') shippingPointId: number,
    @Body('shippingType') shippingType: 'selfShipping' | 'transportCompany',
  ) {
    return this.shipmentsService.setShippingMethod(id, shippingPointId, shippingType);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  create(@Body() body: any) {
    return this.shipmentsService.create(body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() body: any) {
    return this.shipmentsService.update(id, body);
  }

  @Post(':id/orders/:orderId')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  addOrder(@Param('id') id: string, @Param('orderId') orderId: string) {
    return this.shipmentsService.addOrder(id, orderId);
  }

  @Post(':id/supplies/:supplyId')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  addSupply(@Param('id') id: string, @Param('supplyId') supplyId: string) {
    return this.shipmentsService.addSupply(id, supplyId);
  }

  /** Дёргается при скане товара на сборке — подключает заказ к отгрузке как можно раньше, чтобы стикер WB стал доступен сразу. */
  @Post('orders/:orderId/ensure')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER, UserRole.STOREKEEPER, UserRole.PACKER)
  ensureOrderInShipment(@Param('orderId') orderId: string) {
    return this.shipmentsService.ensureOrderInShipment(orderId);
  }
}
