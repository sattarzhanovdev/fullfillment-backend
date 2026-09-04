import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService, SETTING_KEYS } from '../settings/settings.service';

export type DebtState = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'BLOCKED';

@Injectable()
export class DebtsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private settingsService: SettingsService,
  ) {}

  async getBalance(clientId: string): Promise<number> {
    const agg = await this.prisma.debtLedgerEntry.aggregate({
      where: { clientId },
      _sum: { amount: true },
    });
    return Number(agg._sum.amount ?? 0);
  }

  async getActiveOperationsCost(clientId: string): Promise<number> {
    const agg = await this.prisma.marketplaceOrder.aggregate({
      where: {
        clientId,
        status: { in: ['PICKING', 'PACKING', 'READY_TO_SHIP', 'AWAITING_PROCESSING', 'IN_PROGRESS'] },
      },
      _sum: { processingCost: true },
    });
    return Number(agg._sum.processingCost ?? 0);
  }

  stateForPercent(percent: number): DebtState {
    if (percent >= 100) return 'BLOCKED';
    if (percent >= 80) return 'CRITICAL';
    if (percent >= 50) return 'WARNING';
    return 'NORMAL';
  }

  async getSummary(clientId: string) {
    const client = await this.prisma.client.findUniqueOrThrow({ where: { id: clientId } });
    const debt = await this.getBalance(clientId);
    const inProgress = await this.getActiveOperationsCost(clientId);
    const limit = Number(client.debtLimit);
    const percent = limit > 0 ? ((debt + inProgress) / limit) * 100 : 0;
    const state = this.stateForPercent(percent);
    const free = Math.max(0, limit - debt - inProgress);

    return { clientId, debt, inProgress, free, limit, percent: Number(percent.toFixed(1)), state };
  }

  async findAllSummaries() {
    const clients = await this.prisma.client.findMany({ where: { status: 'ACTIVE' } });
    return Promise.all(clients.map((c) => this.getSummary(c.id)));
  }

  async charge(clientId: string, amount: number, reason: string, reference?: string) {
    const entry = await this.prisma.debtLedgerEntry.create({
      data: { clientId, amount, reason, reference },
    });
    await this.maybeNotifyThreshold(clientId);
    return entry;
  }

  async pay(clientId: string, amount: number, reason: string, reference?: string) {
    return this.prisma.debtLedgerEntry.create({
      data: { clientId, amount: -Math.abs(amount), reason, reference },
    });
  }

  private async maybeNotifyThreshold(clientId: string) {
    const summary = await this.getSummary(clientId);
    if (summary.state === 'CRITICAL' || summary.state === 'BLOCKED') {
      await this.notificationsService.create({
        clientId,
        type: summary.state === 'BLOCKED' ? 'LIMIT_EXCEEDED' : 'DEBT',
        title: summary.state === 'BLOCKED' ? 'Превышен лимит задолженности' : 'Критический уровень задолженности',
        message: `Задолженность клиента достигла ${summary.percent}% от лимита (${summary.debt} ₽ из ${summary.limit} ₽).`,
      });
    }
  }

  /** Проверка блокировки операции по задолженности — ТЗ §38. */
  async assertOperationAllowed(clientId: string, operation: 'receiving' | 'picking' | 'packing' | 'shipping') {
    const summary = await this.getSummary(clientId);
    if (summary.state !== 'BLOCKED') return;

    const blockedOps = await this.settingsService.get<string[]>(SETTING_KEYS.DEBT_BLOCKED_OPERATIONS);
    if (blockedOps?.includes(operation)) {
      throw new ForbiddenException(
        `Клиент заблокирован: превышен лимит задолженности (${summary.debt} ₽ из ${summary.limit} ₽)`,
      );
    }
  }
}
