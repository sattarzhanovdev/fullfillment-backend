import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { WarehousesService } from './warehouses.service';

@Controller('warehouses')
export class WarehousesController {
  constructor(private warehousesService: WarehousesService) {}

  @Get()
  findAll() {
    return this.warehousesService.findAllWarehouses();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehousesService.findWarehouse(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  create(@Body() body: { name: string; address?: string }) {
    return this.warehousesService.createWarehouse(body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  update(@Param('id') id: string, @Body() body: any) {
    return this.warehousesService.updateWarehouse(id, body);
  }

  @Post(':id/zones')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  createZone(@Param('id') id: string, @Body() body: { code: string; name?: string; isReturns?: boolean }) {
    return this.warehousesService.createZone(id, body);
  }

  @Patch('zones/:zoneId')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  updateZone(@Param('zoneId') zoneId: string, @Body() body: any) {
    return this.warehousesService.updateZone(zoneId, body);
  }

  @Get('cells/list')
  findCells(@Query('zoneId') zoneId?: string, @Query('warehouseId') warehouseId?: string) {
    return this.warehousesService.findCells({ zoneId, warehouseId });
  }

  @Get('cells/:cellId')
  findCell(@Param('cellId') cellId: string) {
    return this.warehousesService.findCell(cellId);
  }

  @Post('zones/:zoneId/cells')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  createCell(@Param('zoneId') zoneId: string, @Body() body: { code: string; type?: any; capacity?: number }) {
    return this.warehousesService.createCell(zoneId, body);
  }

  @Patch('cells/:cellId')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  updateCell(@Param('cellId') cellId: string, @Body() body: any) {
    return this.warehousesService.updateCell(cellId, body);
  }
}
