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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shipmentsService.findOne(id);
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
}
