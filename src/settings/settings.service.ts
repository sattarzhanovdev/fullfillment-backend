import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const SETTING_KEYS = {
  GENERAL_BUFFER_PERCENT: 'general_buffer_percent',
  GENERAL_DEBT_LIMIT: 'general_debt_limit',
  DEBT_BLOCKED_OPERATIONS: 'debt_blocked_operations', // e.g. ["receiving","picking","packing","shipping"]
  COMPANY_NAME: 'company_name',
} as const;

const DEFAULTS: Record<string, unknown> = {
  [SETTING_KEYS.GENERAL_BUFFER_PERCENT]: 0,
  [SETTING_KEYS.GENERAL_DEBT_LIMIT]: 10000,
  [SETTING_KEYS.DEBT_BLOCKED_OPERATIONS]: ['picking', 'packing', 'shipping'],
  [SETTING_KEYS.COMPANY_NAME]: 'Fulfillment Center',
};

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get<T = unknown>(key: string): Promise<T> {
    const row = await this.prisma.setting.findUnique({ where: { key } });
    return (row ? row.value : DEFAULTS[key]) as T;
  }

  async set(key: string, value: unknown) {
    return this.prisma.setting.upsert({
      where: { key },
      create: { key, value: value as any },
      update: { value: value as any },
    });
  }

  async getAll() {
    const rows = await this.prisma.setting.findMany();
    const map = { ...DEFAULTS };
    for (const row of rows) map[row.key] = row.value;
    return map;
  }
}
