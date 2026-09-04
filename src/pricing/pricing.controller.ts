import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { PricingService } from './pricing.service';

@Controller('prices')
export class PricingController {
  constructor(private pricingService: PricingService) {}

  @Get('general')
  getGeneral() {
    return this.pricingService.getGeneralRule();
  }

  @Post('general')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  setGeneral(@Body() body: { firstLiterPrice: number; nextLiterPrice: number }) {
    return this.pricingService.setGeneralRule(body.firstLiterPrice, body.nextLiterPrice);
  }

  @Get('client/:clientId')
  getClientPrice(@Param('clientId') clientId: string) {
    return this.pricingService.getClientPrice(clientId);
  }

  @Post('client/:clientId')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  setClientPrice(
    @Param('clientId') clientId: string,
    @Body() body: { flatPrice?: number | null; firstLiterPrice?: number | null; nextLiterPrice?: number | null },
  ) {
    return this.pricingService.setClientPrice(clientId, body);
  }

  @Get('product/:productId')
  calculateForProduct(@Param('productId') productId: string) {
    return this.pricingService.calculateForProduct(productId);
  }

  @Get('needs-price/queue')
  needsPriceQueue() {
    return this.pricingService.findNeedsPriceQueue();
  }
}
