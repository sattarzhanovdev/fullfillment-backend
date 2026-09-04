import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SupplyStatus, UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { FboService } from './fbo.service';

@Controller('fbo')
export class FboController {
  constructor(private fboService: FboService) {}

  @Get('supplies')
  findAll(@Query('clientId') clientId?: string, @Query('status') status?: string) {
    const statuses = status ? (status.split(',') as SupplyStatus[]) : undefined;
    return this.fboService.findAll({ clientId, statuses });
  }

  @Get('supplies/:id')
  findOne(@Param('id') id: string) {
    return this.fboService.findOne(id);
  }

  @Post('supplies')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  create(@Body() body: any) {
    return this.fboService.create(body);
  }

  @Patch('supplies/:id/status')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER, UserRole.STOREKEEPER)
  updateStatus(@Param('id') id: string, @Body('status') status: SupplyStatus, @CurrentUser() user: AuthenticatedUser) {
    return this.fboService.transitionStatus(id, status, user.id);
  }

  @Post('supplies/:id/pick')
  @Roles(UserRole.ADMIN, UserRole.STOREKEEPER)
  scanPick(@Param('id') id: string, @Body('barcode') barcode: string) {
    return this.fboService.scanPick(id, barcode);
  }

  @Patch('supplies/:id/boxes')
  @Roles(UserRole.ADMIN, UserRole.STOREKEEPER, UserRole.MANAGER)
  setBoxes(@Param('id') id: string, @Body() body: { boxesCount: number; palletsCount?: number }) {
    return this.fboService.setBoxes(id, body.boxesCount, body.palletsCount);
  }
}
