import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { PackagingService } from './packaging.service';

@Controller('packaging')
export class PackagingController {
  constructor(private packagingService: PackagingService) {}

  @Get()
  findAll(@Query('activeOnly') activeOnly?: string) {
    return this.packagingService.findAll(activeOnly === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagingService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  create(@Body() body: any) {
    return this.packagingService.create(body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  update(@Param('id') id: string, @Body() body: any) {
    return this.packagingService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  remove(@Param('id') id: string) {
    return this.packagingService.remove(id);
  }
}
