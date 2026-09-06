import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { Marketplace, UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { MarketplacesService } from './marketplaces.service';

@Controller('marketplaces')
export class MarketplacesController {
  private readonly logger = new Logger('WebhooksController');

  constructor(private marketplacesService: MarketplacesService) {}

  @Get('client/:clientId')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  findForClient(@Param('clientId') clientId: string) {
    return this.marketplacesService.findForClient(clientId);
  }

  @Post('client/:clientId/:marketplace')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  upsert(
    @Param('clientId') clientId: string,
    @Param('marketplace') marketplace: Marketplace,
    @Body() body: { apiKey?: string; warehouseId?: string; marketplaceId?: string },
  ) {
    return this.marketplacesService.upsert(clientId, marketplace, body);
  }

  @Post(':integrationId/sync')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  sync(@Param('integrationId') integrationId: string) {
    return this.marketplacesService.sync(integrationId);
  }

  // ---- Webhooks (ТЗ §50) — точка расширения под реальные вызовы маркетплейсов ----

  @Public()
  @Post('webhooks/:event')
  @HttpCode(HttpStatus.OK)
  handleWebhook(@Param('event') event: string, @Body() payload: unknown) {
    this.logger.log(`Получен webhook ${event}: ${JSON.stringify(payload)}`);
    return { received: true };
  }
}
