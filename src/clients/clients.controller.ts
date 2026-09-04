import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Get(':id/analytics')
  analytics(@Param('id') id: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.clientsService.analytics(id, { from, to });
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  create(@Body() body: any) {
    return this.clientsService.create(body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() body: any) {
    return this.clientsService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }

  @Post(':id/requisites')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  upsertRequisites(@Param('id') id: string, @Body() body: any) {
    return this.clientsService.upsertRequisites(id, body);
  }

  @Post(':id/contract')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  upsertContract(@Param('id') id: string, @Body() body: any) {
    return this.clientsService.upsertContract(id, body);
  }
}
