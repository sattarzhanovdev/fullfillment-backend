import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { DebtsService } from './debts.service';

@Controller('debts')
export class DebtsController {
  constructor(private debtsService: DebtsService) {}

  @Get()
  findAll() {
    return this.debtsService.findAllSummaries();
  }

  @Get(':clientId')
  getSummary(@Param('clientId') clientId: string) {
    return this.debtsService.getSummary(clientId);
  }

  @Post(':clientId/charge')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  charge(@Param('clientId') clientId: string, @Body() body: { amount: number; reason: string; reference?: string }) {
    return this.debtsService.charge(clientId, body.amount, body.reason, body.reference);
  }

  @Post(':clientId/pay')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  pay(@Param('clientId') clientId: string, @Body() body: { amount: number; reason: string; reference?: string }) {
    return this.debtsService.pay(clientId, body.amount, body.reason, body.reference);
  }
}
