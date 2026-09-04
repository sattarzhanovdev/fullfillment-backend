import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private telegramService: TelegramService) {}

  @Get('client/:clientId')
  getLink(@Param('clientId') clientId: string) {
    return this.telegramService.getLink(clientId);
  }

  @Put('client/:clientId')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  upsertLink(@Param('clientId') clientId: string, @Body() body: any) {
    return this.telegramService.upsertLink(clientId, body);
  }
}
