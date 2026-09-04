import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { FunnelStatus, Marketplace, UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  findAll(
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
    @Query('marketplace') marketplace?: Marketplace,
  ) {
    const statuses = status ? (status.split(',') as FunnelStatus[]) : undefined;
    return this.ordersService.findAll({ clientId, statuses, marketplace });
  }

  @Get('picking/items')
  pickableItems(@Query('clientId') clientId: string) {
    return this.ordersService.pickableItems(clientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER, UserRole.STOREKEEPER, UserRole.PACKER)
  updateStatus(@Param('id') id: string, @Body('status') status: FunnelStatus, @CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.transitionStatus(id, status, user.id);
  }

  @Patch(':id/assign')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  assign(@Param('id') id: string, @Body('assigneeId') assigneeId: string) {
    return this.ordersService.assign(id, assigneeId);
  }

  @Post(':id/pick')
  @Roles(UserRole.ADMIN, UserRole.STOREKEEPER)
  scanPick(@Param('id') id: string, @Body('barcode') barcode: string, @CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.scanPick(id, barcode, user.id);
  }

  @Post(':id/items/:itemId/not-found')
  @Roles(UserRole.ADMIN, UserRole.STOREKEEPER)
  markNotFound(@Param('id') id: string, @Param('itemId') itemId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.markItemNotFound(id, itemId, user.id);
  }

  @Post(':id/pack')
  @Roles(UserRole.ADMIN, UserRole.PACKER)
  scanPack(@Param('id') id: string, @Body('barcode') barcode: string, @CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.scanPack(id, barcode, user.id);
  }

  @Patch(':id/packaging')
  @Roles(UserRole.ADMIN, UserRole.PACKER)
  setPackaging(@Param('id') id: string, @Body('packagingTypeId') packagingTypeId: string) {
    return this.ordersService.setPackaging(id, packagingTypeId);
  }
}
