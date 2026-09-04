import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { MovementsService } from './movements.service';

@Controller('movements')
export class MovementsController {
  constructor(private movementsService: MovementsService) {}

  @Get()
  findAll(@Query('productId') productId?: string, @Query('cellId') cellId?: string) {
    return this.movementsService.findAll({ productId, cellId });
  }

  @Post()
  create(
    @Body() body: { productId: string; clientId: string; fromCellId: string; toCellId: string; qty: number },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.movementsService.create({ ...body, userId: user.id });
  }
}
