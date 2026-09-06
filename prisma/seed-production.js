/**
 * Продакшен-сид: только логины и инфраструктура (склад/зона/ячейки,
 * тариф, типы упаковки, настройки) — БЕЗ демо-клиентов и товаров.
 * Обычный `prisma/seed.ts` (ts-node) в runtime-образе недоступен
 * (там `npm ci --omit=dev`), поэтому это чистый .js на @prisma/client + bcrypt,
 * которые уже есть в проде. Запуск: node prisma/seed-production.js
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@wb-fulfillment.local' },
    create: { email: 'admin@wb-fulfillment.local', passwordHash: password, fullName: 'Администратор', role: 'ADMIN' },
    update: {},
  });
  await prisma.user.upsert({
    where: { email: 'director@wb-fulfillment.local' },
    create: { email: 'director@wb-fulfillment.local', passwordHash: password, fullName: 'Руководитель', role: 'DIRECTOR' },
    update: {},
  });
  await prisma.user.upsert({
    where: { email: 'manager@wb-fulfillment.local' },
    create: { email: 'manager@wb-fulfillment.local', passwordHash: password, fullName: 'Менеджер', role: 'MANAGER' },
    update: {},
  });
  await prisma.user.upsert({
    where: { email: 'storekeeper@wb-fulfillment.local' },
    create: { email: 'storekeeper@wb-fulfillment.local', passwordHash: password, fullName: 'Кладовщик', role: 'STOREKEEPER' },
    update: {},
  });
  await prisma.user.upsert({
    where: { email: 'packer@wb-fulfillment.local' },
    create: { email: 'packer@wb-fulfillment.local', passwordHash: password, fullName: 'Упаковщик', role: 'PACKER' },
    update: {},
  });

  let warehouse = await prisma.warehouse.findFirst({ where: { name: 'Основной склад' } });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({ data: { name: 'Основной склад' } });
  }

  let zoneA = await prisma.zone.findFirst({ where: { warehouseId: warehouse.id, code: 'A' } });
  if (!zoneA) {
    zoneA = await prisma.zone.create({ data: { warehouseId: warehouse.id, code: 'A', name: 'Зона A' } });
  }
  let zoneReturns = await prisma.zone.findFirst({ where: { warehouseId: warehouse.id, code: 'RET' } });
  if (!zoneReturns) {
    await prisma.zone.create({ data: { warehouseId: warehouse.id, code: 'RET', name: 'Зона возвратов', isReturns: true } });
  }

  const cellCodes = ['A-01-01', 'A-01-02', 'A-01-03'];
  for (const code of cellCodes) {
    const cell = await prisma.cell.findFirst({ where: { zoneId: zoneA.id, code } });
    if (!cell) {
      await prisma.cell.create({ data: { zoneId: zoneA.id, code, type: 'SHELF', capacity: 500 } });
    }
  }

  const existingRule = await prisma.priceRule.findFirst();
  await prisma.priceRule.upsert({
    where: { id: existingRule?.id ?? '__none__' },
    create: { name: 'general', firstLiterPrice: 15, nextLiterPrice: 5 },
    update: {},
  });

  const existingBag = await prisma.packagingType.findFirst({ where: { kind: 'пакет' } });
  await prisma.packagingType.upsert({
    where: { id: existingBag?.id ?? '__none__' },
    create: { name: 'Курьерский пакет', kind: 'пакет', cost: 5, maxVolumeL: 5 },
    update: {},
  });
  const existingBox = await prisma.packagingType.findFirst({ where: { kind: 'коробка' } });
  await prisma.packagingType.upsert({
    where: { id: existingBox?.id ?? '__none__' },
    create: { name: 'Коробка средняя', kind: 'коробка', cost: 25, maxVolumeL: 30 },
    update: {},
  });

  await prisma.setting.upsert({
    where: { key: 'general_buffer_percent' },
    create: { key: 'general_buffer_percent', value: 10 },
    update: {},
  });
  await prisma.setting.upsert({
    where: { key: 'general_debt_limit' },
    create: { key: 'general_debt_limit', value: 10000 },
    update: {},
  });
  await prisma.setting.upsert({
    where: { key: 'debt_blocked_operations' },
    create: { key: 'debt_blocked_operations', value: ['picking', 'packing', 'shipping'] },
    update: {},
  });

  console.log('Продакшен-сид завершён: только логины и инфраструктура, без демо-клиентов/товаров.');
  console.log('Логины (пароль для всех: password123) — смените пароли после первого входа:');
  console.log('  admin@wb-fulfillment.local (Администратор)');
  console.log('  director@wb-fulfillment.local (Руководитель)');
  console.log('  manager@wb-fulfillment.local (Менеджер)');
  console.log('  storekeeper@wb-fulfillment.local (Кладовщик)');
  console.log('  packer@wb-fulfillment.local (Упаковщик)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
