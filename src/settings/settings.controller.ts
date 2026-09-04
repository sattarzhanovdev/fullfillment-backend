import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  getAll() {
    return this.settingsService.getAll();
  }

  @Put(':key')
  @Roles(UserRole.ADMIN)
  set(@Param('key') key: string, @Body('value') value: unknown) {
    return this.settingsService.set(key, value);
  }
}
