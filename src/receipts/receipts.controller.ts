import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { ReceiptsService } from './receipts.service';

@Controller('receipts')
export class ReceiptsController {
  constructor(private receiptsService: ReceiptsService) {}

  @Get()
  findAll(@Query('clientId') clientId?: string, @Query('status') status?: string) {
    return this.receiptsService.findAll({ clientId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receiptsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER, UserRole.STOREKEEPER)
  create(@Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    return this.receiptsService.create(body, user.id);
  }

  @Post(':id/scan')
  @Roles(UserRole.ADMIN, UserRole.STOREKEEPER)
  scan(
    @Param('id') id: string,
    @Body() body: { barcode: string; cellId: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.receiptsService.scanItem(id, body.barcode, body.cellId, user.id);
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.STOREKEEPER, UserRole.MANAGER)
  complete(@Param('id') id: string) {
    return this.receiptsService.complete(id);
  }
}
