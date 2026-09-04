import { PricingService } from './pricing.service';

function makePrismaMock(overrides: {
  product?: any;
  clientPrice?: any;
  generalRule?: any;
}) {
  return {
    product: {
      findUniqueOrThrow: jest.fn().mockResolvedValue(overrides.product),
    },
    clientPrice: {
      findUnique: jest.fn().mockResolvedValue(overrides.clientPrice ?? null),
    },
    priceRule: {
      findFirst: jest.fn().mockResolvedValue(overrides.generalRule ?? null),
    },
  } as any;
}

describe('PricingService', () => {
  describe('computeLiters', () => {
    it('rounds volume up to the nearest whole liter, minimum 1', () => {
      const service = new PricingService(makePrismaMock({}));
      expect(service.computeLiters(10, 10, 2)).toBe(1); // 0.2L -> 1L
      expect(service.computeLiters(10, 10, 7)).toBe(1); // 0.7L -> 1L
      expect(service.computeLiters(10, 10, 10)).toBe(1); // 1.0L -> 1L
      expect(service.computeLiters(10, 10, 12)).toBe(2); // 1.2L -> 2L
      expect(service.computeLiters(10, 10, 23)).toBe(3); // 2.3L -> 3L
    });

    it('returns null when dimensions are missing', () => {
      const service = new PricingService(makePrismaMock({}));
      expect(service.computeLiters(null, 10, 10)).toBeNull();
      expect(service.computeLiters(10, null, 10)).toBeNull();
    });
  });

  describe('priceByLiters', () => {
    it('matches the ТЗ example: 15 + (3-1)*5 = 25', () => {
      const service = new PricingService(makePrismaMock({}));
      expect(service.priceByLiters(3, 15, 5)).toBe(25);
    });
  });

  describe('calculateForProduct priority chain', () => {
    const baseProduct = {
      id: 'p1',
      clientId: 'c1',
      fbsProcessingPrice: null,
      lengthCm: 20,
      widthCm: 12,
      heightCm: 10, // 2.4L -> ceil 3L
    };

    it('uses the product own price first', async () => {
      const prisma = makePrismaMock({ product: { ...baseProduct, fbsProcessingPrice: 42 } });
      const service = new PricingService(prisma);
      const result = await service.calculateForProduct('p1');
      expect(result).toEqual({ price: 42, source: 'PRODUCT' });
    });

    it('uses the client flat price, including an explicit zero', async () => {
      const prisma = makePrismaMock({
        product: baseProduct,
        clientPrice: { flatPrice: 0, firstLiterPrice: null, nextLiterPrice: null },
      });
      const service = new PricingService(prisma);
      const result = await service.calculateForProduct('p1');
      expect(result).toEqual({ price: 0, source: 'CLIENT_FLAT' });
    });

    it('uses the client formula when no flat price is set', async () => {
      const prisma = makePrismaMock({
        product: baseProduct,
        clientPrice: { flatPrice: null, firstLiterPrice: 10, nextLiterPrice: 2 },
      });
      const service = new PricingService(prisma);
      const result = await service.calculateForProduct('p1');
      expect(result).toEqual({ price: 10 + (3 - 1) * 2, source: 'CLIENT_FORMULA', liters: 3 });
    });

    it('falls back to the general formula', async () => {
      const prisma = makePrismaMock({
        product: baseProduct,
        generalRule: { firstLiterPrice: 15, nextLiterPrice: 5 },
      });
      const service = new PricingService(prisma);
      const result = await service.calculateForProduct('p1');
      expect(result).toEqual({ price: 25, source: 'GENERAL', liters: 3 });
    });

    it('requires price when nothing applies', async () => {
      const prisma = makePrismaMock({ product: baseProduct });
      const service = new PricingService(prisma);
      const result = await service.calculateForProduct('p1');
      expect(result.source).toBe('NEEDS_PRICE');
    });

    it('requires price when dimensions are missing and only a formula exists', async () => {
      const prisma = makePrismaMock({
        product: { ...baseProduct, lengthCm: null },
        generalRule: { firstLiterPrice: 15, nextLiterPrice: 5 },
      });
      const service = new PricingService(prisma);
      const result = await service.calculateForProduct('p1');
      expect(result.source).toBe('NEEDS_PRICE');
      expect(result.reason).toBeDefined();
    });
  });
});
