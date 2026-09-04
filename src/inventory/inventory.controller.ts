import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.STOREKEEPER)
  create(@Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    return this.inventoryService.create(body, user.id);
  }

  @Post(':id/scan')
  @Roles(UserRole.ADMIN, UserRole.STOREKEEPER)
  scan(@Param('id') id: string, @Body('productId') productId: string) {
    return this.inventoryService.scanLine(id, productId);
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.STOREKEEPER)
  complete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.inventoryService.complete(id, user.id);
  }
}
