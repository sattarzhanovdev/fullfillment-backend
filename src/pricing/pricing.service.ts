import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type PriceSource = 'PRODUCT' | 'CLIENT_FLAT' | 'CLIENT_FORMULA' | 'GENERAL' | 'NEEDS_PRICE';

export interface PriceResult {
  price: number | null;
  source: PriceSource;
  reason?: string;
  liters?: number;
}

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  /** Объём в литрах, округлённый вверх до целого литра (минимум 1) — ТЗ §30. */
  computeLiters(lengthCm?: number | null, widthCm?: number | null, heightCm?: number | null): number | null {
    if (!lengthCm || !widthCm || !heightCm) return null;
    const volumeLiters = (lengthCm * widthCm * heightCm) / 1000;
    const rounded = Math.round(volumeLiters * 10000) / 10000;
    return Math.max(1, Math.ceil(rounded));
  }

  /** Цена = цена первого литра + (литры - 1) × цена следующего литра — ТЗ §30. */
  priceByLiters(liters: number, firstLiterPrice: number, nextLiterPrice: number): number {
    return Number((firstLiterPrice + (liters - 1) * nextLiterPrice).toFixed(2));
  }

  async getGeneralRule() {
    return this.prisma.priceRule.findFirst({ orderBy: { updatedAt: 'desc' } });
  }

  async setGeneralRule(firstLiterPrice: number, nextLiterPrice: number) {
    const existing = await this.getGeneralRule();
    if (existing) {
      return this.prisma.priceRule.update({
        where: { id: existing.id },
        data: { firstLiterPrice, nextLiterPrice },
      });
    }
    return this.prisma.priceRule.create({ data: { firstLiterPrice, nextLiterPrice } });
  }

  async getClientPrice(clientId: string) {
    return this.prisma.clientPrice.findUnique({ where: { clientId } });
  }

  async setClientPrice(
    clientId: string,
    data: { flatPrice?: number | null; firstLiterPrice?: number | null; nextLiterPrice?: number | null },
  ) {
    return this.prisma.clientPrice.upsert({
      where: { clientId },
      create: { clientId, ...data },
      update: data,
    });
  }

  /** Приоритетная цепочка расчёта стоимости обработки FBS-единицы товара — ТЗ §31-35. */
  async calculateForProduct(productId: string): Promise<PriceResult> {
    const product = await this.prisma.product.findUniqueOrThrow({ where: { id: productId } });

    // 1. Цена конкретного товара
    if (product.fbsProcessingPrice !== null && product.fbsProcessingPrice !== undefined) {
      return { price: Number(product.fbsProcessingPrice), source: 'PRODUCT' };
    }

    const clientPrice = await this.getClientPrice(product.clientId);
    const liters = this.computeLiters(
      product.lengthCm ? Number(product.lengthCm) : null,
      product.widthCm ? Number(product.widthCm) : null,
      product.heightCm ? Number(product.heightCm) : null,
    );

    // 2. Цена клиента (плоская, включая явный ноль)
    if (clientPrice?.flatPrice !== null && clientPrice?.flatPrice !== undefined) {
      return { price: Number(clientPrice.flatPrice), source: 'CLIENT_FLAT' };
    }

    // 3. Формула клиента
    if (
      clientPrice?.firstLiterPrice !== null &&
      clientPrice?.firstLiterPrice !== undefined &&
      clientPrice?.nextLiterPrice !== null &&
      clientPrice?.nextLiterPrice !== undefined
    ) {
      if (liters === null) {
        return { price: null, source: 'NEEDS_PRICE', reason: 'Нет габаритов товара' };
      }
      return {
        price: this.priceByLiters(liters, Number(clientPrice.firstLiterPrice), Number(clientPrice.nextLiterPrice)),
        source: 'CLIENT_FORMULA',
        liters,
      };
    }

    // 4. Общая формула
    const general = await this.getGeneralRule();
    if (general) {
      if (liters === null) {
        return { price: null, source: 'NEEDS_PRICE', reason: 'Нет габаритов товара' };
      }
      return {
        price: this.priceByLiters(liters, Number(general.firstLiterPrice), Number(general.nextLiterPrice)),
        source: 'GENERAL',
        liters,
      };
    }

    // 5. Требует цены
    return { price: null, source: 'NEEDS_PRICE', reason: 'Нет подходящих условий для расчёта цены' };
  }

  /** Список товаров без возможности рассчитать цену (очередь "Требует цены" — ТЗ §35). */
  async findNeedsPriceQueue() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { client: true },
    });
    const results: Array<{ product: (typeof products)[number]; result: PriceResult }> = [];
    for (const product of products) {
      const result = await this.calculateForProduct(product.id);
      if (result.source === 'NEEDS_PRICE') {
        results.push({ product, result });
      }
    }
    return results;
  }
}
