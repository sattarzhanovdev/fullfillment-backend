import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const SETTING_KEYS = {
  GENERAL_BUFFER_PERCENT: 'general_buffer_percent',
  GENERAL_DEBT_LIMIT: 'general_debt_limit',
  DEBT_BLOCKED_OPERATIONS: 'debt_blocked_operations', // e.g. ["receiving","picking","packing","shipping"]
  COMPANY_NAME: 'company_name',
  SERVICE_PRICE_RECEIVING: 'service_price_receiving',
  SERVICE_PRICE_STORAGE: 'service_price_storage',
  SERVICE_PRICE_PICKING_FBS: 'service_price_picking_fbs',
  SERVICE_PRICE_PACKING: 'service_price_packing',
  SERVICE_PRICE_LABEL: 'service_price_label',
  SERVICE_PRICE_SHIPPING: 'service_price_shipping',
  SERVICE_PRICE_RETURN: 'service_price_return',
  SERVICE_PRICE_PALLET: 'service_price_pallet',
} as const;

const DEFAULTS: Record<string, unknown> = {
  [SETTING_KEYS.GENERAL_BUFFER_PERCENT]: 0,
  [SETTING_KEYS.GENERAL_DEBT_LIMIT]: 10000,
  [SETTING_KEYS.DEBT_BLOCKED_OPERATIONS]: ['picking', 'packing', 'shipping'],
  [SETTING_KEYS.COMPANY_NAME]: 'Fulfillment Center',
  [SETTING_KEYS.SERVICE_PRICE_RECEIVING]: 5,
  [SETTING_KEYS.SERVICE_PRICE_STORAGE]: 0.5,
  [SETTING_KEYS.SERVICE_PRICE_PICKING_FBS]: 30,
  [SETTING_KEYS.SERVICE_PRICE_PACKING]: 20,
  [SETTING_KEYS.SERVICE_PRICE_LABEL]: 5,
  [SETTING_KEYS.SERVICE_PRICE_SHIPPING]: 15,
  [SETTING_KEYS.SERVICE_PRICE_RETURN]: 30,
  [SETTING_KEYS.SERVICE_PRICE_PALLET]: 500,
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
