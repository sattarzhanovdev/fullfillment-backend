/**
 * Наполняет систему реалистичными демо-данными для проверки аналитики,
 * дашборда, kanban и т.д.: несколько клиентов, товары, ~90 дней истории
 * заказов/поставок/приёмок с разными статусами, долгами и уведомлениями.
 *
 * Идемпотентен: если демо-клиент "ООО Ромашка" уже существует — скрипт
 * ничего не делает повторно (защита от дублирования при повторном запуске).
 */
import { PrismaClient, FunnelStatus, Marketplace } from '@prisma/client';

const prisma = new PrismaClient();

function daysAgo(days: number, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, Math.floor(Math.random() * 60), 0);
  return d;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

let orderCounter = 2000;
function nextOrderNumber() {
  orderCounter += 1;
  return `WB-${orderCounter}`;
}
let supplyCounter = 3000;
function nextSupplyNumber() {
  supplyCounter += 1;
  return `FBO-${supplyCounter}`;
}

async function main() {
  const existing = await prisma.client.findFirst({ where: { name: 'ООО "Ромашка"' } });
  if (existing) {
    console.log('Демо-данные уже загружены, пропускаю (найден клиент "ООО Ромашка").');
    return;
  }

  const manager = await prisma.user.findUniqueOrThrow({ where: { email: 'manager@wb-fulfillment.local' } });
  const storekeeper = await prisma.user.findUniqueOrThrow({ where: { email: 'storekeeper@wb-fulfillment.local' } });
  const packer = await prisma.user.findUniqueOrThrow({ where: { email: 'packer@wb-fulfillment.local' } });

  const warehouse = await prisma.warehouse.findFirstOrThrow({ where: { name: 'Основной склад' } });
  let zoneA = await prisma.zone.findFirstOrThrow({ where: { warehouseId: warehouse.id, code: 'A' } });

  // Дополнительные ячейки под новые товары
  const extraCellCodes = ['A-02-01', 'A-02-02', 'A-02-03', 'A-03-01', 'A-03-02'];
  const cells = await prisma.cell.findMany({ where: { zoneId: zoneA.id } });
  const cellMap = new Map(cells.map((c) => [c.code, c]));
  for (const code of extraCellCodes) {
    if (!cellMap.has(code)) {
      const cell = await prisma.cell.create({ data: { zoneId: zoneA.id, code, type: 'SHELF', capacity: 500 } });
      cellMap.set(code, cell);
    }
  }
  const allCells = Array.from(cellMap.values());

  const existingClient = await prisma.client.findFirstOrThrow({ where: { name: 'ИП Матаев' } });

  // ---------- Новые клиенты ----------
  const clientDefs = [
    { name: 'ООО "Ромашка"', type: 'OOO' as const, debtLimit: 15000, bufferPercent: 15, priceFormula: { first: 20, next: 7 } },
    { name: 'ИП Соколова', type: 'IP' as const, debtLimit: 8000, bufferPercent: null, flatPrice: 0 },
    { name: 'ООО "Технопарк"', type: 'OOO' as const, debtLimit: 20000, bufferPercent: null },
    { name: 'ИП Волков', type: 'IP' as const, debtLimit: 2000, bufferPercent: null }, // будет заблокирован по долгу
  ];

  const clients = [existingClient];
  for (const def of clientDefs) {
    const client = await prisma.client.create({
      data: { name: def.name, type: def.type, managerId: manager.id, debtLimit: def.debtLimit, bufferPercent: def.bufferPercent },
    });
    clients.push(client);

    await prisma.clientRequisites.create({
      data: {
        clientId: client.id,
        legalName: def.type === 'OOO' ? def.name : `${def.name} (ИНН случайный)`,
        inn: String(randInt(770000000000, 779999999999)),
        legalAddress: 'г. Москва, ул. Промышленная, д. ' + randInt(1, 50),
        phone: '+7 9' + randInt(10, 99) + ' ' + randInt(100, 999) + '-' + randInt(10, 99) + '-' + randInt(10, 99),
        email: def.name.replace(/[^a-zA-Zа-яА-Я]/g, '').toLowerCase() + '@example.com',
        contactPerson: 'Контактное лицо',
      },
    });

    await prisma.contract.create({
      data: {
        clientId: client.id,
        number: `Д-2026-0${clients.length}`,
        date: daysAgo(90),
        startDate: daysAgo(88),
        termMonths: 12,
        tariff: 'Стандарт',
        status: 'ACTIVE',
      },
    });

    if ('priceFormula' in def && def.priceFormula) {
      await prisma.clientPrice.create({
        data: { clientId: client.id, firstLiterPrice: def.priceFormula.first, nextLiterPrice: def.priceFormula.next },
      });
    }
    if ('flatPrice' in def && def.flatPrice !== undefined) {
      await prisma.clientPrice.create({ data: { clientId: client.id, flatPrice: def.flatPrice } });
    }
  }

  // ---------- Товары ----------
  const packaging = await prisma.packagingType.findMany();
  const bag = packaging.find((p) => p.kind === 'пакет') ?? packaging[0];

  const productCatalog: Record<string, { name: string; l?: number; w?: number; h?: number; weight?: number }[]> = {
    'ИП Матаев': [
      { name: 'Кулон "Звезда"', l: 8, w: 6, h: 2, weight: 0.03 },
      { name: 'Цепочка серебряная', l: 12, w: 4, h: 2, weight: 0.02 },
    ],
    'ООО "Ромашка"': [
      { name: 'Чехол для телефона', l: 16, w: 8, h: 1.5, weight: 0.05 },
      { name: 'Защитное стекло', l: 15, w: 7, h: 0.5, weight: 0.02 },
      { name: 'Наушники беспроводные', l: 6, w: 6, h: 3, weight: 0.06 },
      { name: 'Powerbank 10000mAh', l: 14, w: 7, h: 1.5, weight: 0.22 },
      { name: 'Кабель USB-C 1м', l: 10, w: 5, h: 2, weight: 0.04 },
      { name: 'Товар без габаритов (образец)' },
    ],
    'ИП Соколова': [
      { name: 'Крем для рук 50мл', l: 5, w: 5, h: 10, weight: 0.08 },
      { name: 'Шампунь 250мл', l: 6, w: 6, h: 18, weight: 0.27 },
      { name: 'Набор кистей для макияжа', l: 20, w: 5, h: 4, weight: 0.15 },
      { name: 'Маска для лица (упаковка 5шт)', l: 12, w: 9, h: 1, weight: 0.05 },
      { name: 'Помада матовая', l: 3, w: 3, h: 8, weight: 0.02 },
    ],
    'ООО "Технопарк"': [
      { name: 'Отвёртка крестовая', l: 20, w: 3, h: 3, weight: 0.09 },
      { name: 'Набор бит 32шт', l: 18, w: 12, h: 3, weight: 0.25 },
      { name: 'Фонарик LED', l: 14, w: 4, h: 4, weight: 0.12 },
      { name: 'Рулетка 5м', l: 8, w: 8, h: 4, weight: 0.18 },
      { name: 'Товар без габаритов (инструмент)' },
    ],
    'ИП Волков': [
      { name: 'Носки хлопковые (3 пары)', l: 15, w: 10, h: 3, weight: 0.1 },
      { name: 'Футболка базовая', l: 30, w: 25, h: 2, weight: 0.18 },
      { name: 'Кепка бейсболка', l: 25, w: 20, h: 12, weight: 0.09 },
    ],
  };

  let article = 100;
  let barcode = 2000000000100;
  const productsByClient = new Map<string, { id: string; barcode: string }[]>();

  for (const client of clients) {
    const items = productCatalog[client.name] ?? [];
    const created: { id: string; barcode: string }[] = [];
    for (const item of items) {
      article += 1;
      barcode += 1;
      const hasOwnPrice = Math.random() < 0.15;
      const product = await prisma.product.create({
        data: {
          clientId: client.id,
          name: item.name,
          sku: `SKU-${article}`,
          article: `ART-${article}`,
          barcode: String(barcode),
          lengthCm: item.l,
          widthCm: item.w,
          heightCm: item.h,
          weightKg: item.weight,
          packagingTypeId: bag?.id,
          fbsProcessingPrice: hasOwnPrice ? randInt(15, 60) : null,
          bufferPercent: Math.random() < 0.1 ? randInt(5, 30) : null,
        },
      });
      created.push({ id: product.id, barcode: product.barcode });

      // Начальный остаток товара на складе
      const cell = pick(allCells);
      const initialQty = randInt(60, 220);
      await prisma.stock.create({
        data: { productId: product.id, cellId: cell.id, clientId: client.id, physicalQty: initialQty },
      });
      await prisma.productHistoryEntry.create({
        data: {
          productId: product.id,
          delta: initialQty,
          reason: 'Приёмка',
          reference: 'Начальный остаток (демо-данные)',
          createdAt: daysAgo(60),
        },
      });
    }
    productsByClient.set(client.id, created);
  }

  // Существующие товары ИП Матаев тоже участвуют
  const existingProducts = await prisma.product.findMany({ where: { clientId: existingClient.id } });
  productsByClient.set(
    existingClient.id,
    (productsByClient.get(existingClient.id) ?? []).concat(existingProducts.map((p) => ({ id: p.id, barcode: p.barcode }))),
  );

  // ---------- Вспомогательная функция: списать физический остаток напрямую (историческая отгрузка) ----------
  async function shipProductHistorical(productId: string, qty: number, at: Date, reference: string) {
    const stocks = await prisma.stock.findMany({ where: { productId }, orderBy: { physicalQty: 'desc' } });
    let remaining = qty;
    for (const s of stocks) {
      if (remaining <= 0) break;
      const take = Math.min(s.physicalQty, remaining);
      if (take <= 0) continue;
      await prisma.stock.update({ where: { id: s.id }, data: { physicalQty: { decrement: take } } });
      await prisma.productHistoryEntry.create({
        data: { productId, delta: -take, reason: 'Отгрузка', reference, createdAt: at },
      });
      remaining -= take;
    }
  }

  // ---------- Историчные завершённые FBS-заказы (для графиков за ~45 дней) ----------
  const staffPickers = [storekeeper, packer];
  let totalHistoricalOrders = 0;

  for (let dayOffset = 44; dayOffset >= 1; dayOffset -= 1) {
    const ordersToday = randInt(0, 4);
    for (let i = 0; i < ordersToday; i += 1) {
      const client = pick(clients);
      const products = productsByClient.get(client.id) ?? [];
      if (products.length === 0) continue;

      const itemCount = randInt(1, 2);
      const chosenProducts = Array.from({ length: itemCount }, () => pick(products));
      const orderDate = daysAgo(dayOffset, randInt(8, 19), randInt(0, 59));

      const order = await prisma.marketplaceOrder.create({
        data: {
          orderNumber: nextOrderNumber(),
          marketplace: Marketplace.WILDBERRIES,
          clientId: client.id,
          status: 'COMPLETED',
          priority: 'NORMAL',
          assigneeId: pick(staffPickers).id,
          orderedAt: orderDate,
          createdAt: orderDate,
          items: {
            create: chosenProducts.map((p) => ({ productId: p.id, qtyNeeded: randInt(1, 3), qtyPicked: 0, qtyPacked: 0 })),
          },
        },
        include: { items: true },
      });

      let processingCost = 0;
      for (const item of order.items) {
        const product = await prisma.product.findUniqueOrThrow({ where: { id: item.productId } });
        const unitPrice = product.fbsProcessingPrice ? Number(product.fbsProcessingPrice) : randInt(15, 40);
        processingCost += unitPrice * item.qtyNeeded;
        await prisma.orderItem.update({
          where: { id: item.id },
          data: { qtyPicked: item.qtyNeeded, qtyPacked: item.qtyNeeded },
        });
        await shipProductHistorical(item.productId, item.qtyNeeded, orderDate, `FBS заказ №${order.orderNumber}`);
      }

      const pickedAt = new Date(orderDate.getTime() + randInt(3, 20) * 60_000);
      const packedAt = new Date(pickedAt.getTime() + randInt(2, 15) * 60_000);
      const shippedAt = new Date(packedAt.getTime() + randInt(30, 240) * 60_000);

      await prisma.orderStatusHistory.createMany({
        data: [
          { orderId: order.id, status: 'AWAITING_PROCESSING', createdAt: orderDate },
          { orderId: order.id, status: 'PICKING', userId: storekeeper.id, createdAt: orderDate },
          { orderId: order.id, status: 'PICKED', userId: storekeeper.id, createdAt: pickedAt },
          { orderId: order.id, status: 'PACKING', userId: packer.id, createdAt: pickedAt },
          { orderId: order.id, status: 'PACKED', userId: packer.id, createdAt: packedAt },
          { orderId: order.id, status: 'READY_TO_SHIP', createdAt: packedAt },
          { orderId: order.id, status: 'SHIPPED', createdAt: shippedAt },
          { orderId: order.id, status: 'COMPLETED', createdAt: shippedAt },
        ],
      });

      await prisma.marketplaceOrder.update({
        where: { id: order.id },
        data: { processingCost, updatedAt: shippedAt },
      });

      await prisma.debtLedgerEntry.create({
        data: {
          clientId: client.id,
          amount: processingCost,
          reason: 'Обработка FBS-заказа',
          reference: order.orderNumber,
          createdAt: shippedAt,
        },
      });

      // Периодически клиент "гасит" часть долга
      if (Math.random() < 0.25) {
        await prisma.debtLedgerEntry.create({
          data: {
            clientId: client.id,
            amount: -Math.round(processingCost * 0.7),
            reason: 'Оплата от клиента',
            reference: `Оплата по заказу ${order.orderNumber}`,
            createdAt: new Date(shippedAt.getTime() + 2 * 24 * 60 * 60 * 1000),
          },
        });
      }

      totalHistoricalOrders += 1;
    }
  }
  console.log(`Создано исторических завершённых заказов: ${totalHistoricalOrders}`);

  // ---------- Активные заказы "в моменте" (для kanban / дашборда) ----------
  const activeStatuses: { status: FunnelStatus; qtyPickedRatio: number; qtyPackedRatio: number }[] = [
    { status: 'NEW_REQUEST', qtyPickedRatio: 0, qtyPackedRatio: 0 },
    { status: 'AWAITING_PROCESSING', qtyPickedRatio: 0, qtyPackedRatio: 0 },
    { status: 'PICKING', qtyPickedRatio: 0.5, qtyPackedRatio: 0 },
    { status: 'PICKED', qtyPickedRatio: 1, qtyPackedRatio: 0 },
    { status: 'PACKING', qtyPickedRatio: 1, qtyPackedRatio: 0.5 },
    { status: 'PACKED', qtyPickedRatio: 1, qtyPackedRatio: 1 },
    { status: 'READY_TO_SHIP', qtyPickedRatio: 1, qtyPackedRatio: 1 },
  ];

  for (const def of activeStatuses) {
    const client = clients.find((c) => c.name === 'ООО "Ромашка"') ?? clients[0];
    const products = (productsByClient.get(client.id) ?? []).slice(0, 2);
    if (products.length === 0) continue;
    const orderDate = daysAgo(0, randInt(7, 16));

    const order = await prisma.marketplaceOrder.create({
      data: {
        orderNumber: nextOrderNumber(),
        marketplace: Marketplace.WILDBERRIES,
        clientId: client.id,
        status: def.status,
        priority: pick(['NORMAL', 'HIGH', 'URGENT'] as const),
        assigneeId: pick(staffPickers).id,
        orderedAt: orderDate,
        createdAt: orderDate,
        deadline: new Date(Date.now() + randInt(1, 3) * 24 * 60 * 60 * 1000),
        items: { create: products.map((p) => ({ productId: p.id, qtyNeeded: 2 })) },
      },
      include: { items: true },
    });

    for (const item of order.items) {
      const qtyPicked = Math.round(item.qtyNeeded * def.qtyPickedRatio);
      const qtyPacked = Math.round(item.qtyNeeded * def.qtyPackedRatio);
      await prisma.orderItem.update({ where: { id: item.id }, data: { qtyPicked, qtyPacked } });

      // Резервируем под заказ (как это делает StockService.reserve на бою)
      const stock = await prisma.stock.findFirst({ where: { productId: item.productId }, orderBy: { physicalQty: 'desc' } });
      if (stock) {
        await prisma.stock.update({ where: { id: stock.id }, data: { reservedQty: { increment: item.qtyNeeded } } });
        await prisma.reservation.create({
          data: { productId: item.productId, clientId: client.id, orderId: order.id, qty: item.qtyNeeded },
        });
      }
    }

    await prisma.orderStatusHistory.create({ data: { orderId: order.id, status: def.status, createdAt: orderDate } });
  }

  // ---------- Проблемные заказы ----------
  const romashka = clients.find((c) => c.name === 'ООО "Ромашка"')!;
  const noDimsProduct = (await prisma.product.findFirst({ where: { clientId: romashka.id, lengthCm: null } }))!;
  if (noDimsProduct) {
    await prisma.marketplaceOrder.create({
      data: {
        orderNumber: nextOrderNumber(),
        marketplace: Marketplace.WILDBERRIES,
        clientId: romashka.id,
        status: 'NEEDS_PRICE',
        createdAt: daysAgo(0, 9),
        items: { create: [{ productId: noDimsProduct.id, qtyNeeded: 1 }] },
      },
    });
  }

  const technopark = clients.find((c) => c.name === 'ООО "Технопарк"')!;
  const tpProducts = productsByClient.get(technopark.id) ?? [];
  if (tpProducts.length > 0) {
    const order = await prisma.marketplaceOrder.create({
      data: {
        orderNumber: nextOrderNumber(),
        marketplace: Marketplace.WILDBERRIES,
        clientId: technopark.id,
        status: 'ITEM_NOT_FOUND',
        createdAt: daysAgo(0, 11),
        items: { create: [{ productId: tpProducts[0].id, qtyNeeded: 1, notFound: true }] },
      },
    });
    await prisma.notification.create({
      data: {
        clientId: technopark.id,
        type: 'ITEM_NOT_FOUND',
        title: 'Товар не найден при сборке',
        message: `Заказ №${order.orderNumber}: товар не найден на складе.`,
        createdAt: daysAgo(0, 11, 5),
      },
    });
  }

  // Клиент "ИП Волков" — превышение лимита долга
  const volkov = clients.find((c) => c.name === 'ИП Волков')!;
  await prisma.debtLedgerEntry.create({
    data: { clientId: volkov.id, amount: 2500, reason: 'Обработка крупной партии', reference: 'Демо-превышение лимита', createdAt: daysAgo(1) },
  });
  const volkovProducts = productsByClient.get(volkov.id) ?? [];
  if (volkovProducts.length > 0) {
    await prisma.marketplaceOrder.create({
      data: {
        orderNumber: nextOrderNumber(),
        marketplace: Marketplace.WILDBERRIES,
        clientId: volkov.id,
        status: 'BLOCKED_DEBT',
        createdAt: daysAgo(0, 8),
        items: { create: [{ productId: volkovProducts[0].id, qtyNeeded: 1 }] },
      },
    });
  }
  await prisma.notification.create({
    data: {
      clientId: volkov.id,
      type: 'LIMIT_EXCEEDED',
      title: 'Превышен лимит задолженности',
      message: `Клиент "ИП Волков" превысил лимит задолженности. Новые операции заблокированы.`,
      createdAt: daysAgo(1, 12),
    },
  });

  // Несколько отменённых заказов
  for (let i = 0; i < 3; i += 1) {
    const client = pick(clients);
    const products = productsByClient.get(client.id) ?? [];
    if (products.length === 0) continue;
    const orderDate = daysAgo(randInt(2, 20));
    await prisma.marketplaceOrder.create({
      data: {
        orderNumber: nextOrderNumber(),
        marketplace: Marketplace.WILDBERRIES,
        clientId: client.id,
        status: 'CANCELLED',
        createdAt: orderDate,
        items: { create: [{ productId: pick(products).id, qtyNeeded: 1 }] },
      },
    });
  }

  // ---------- FBO поставки ----------
  const supplyStatuses: { status: string; daysAgoVal: number }[] = [
    { status: 'COMPLETED', daysAgoVal: 30 },
    { status: 'COMPLETED', daysAgoVal: 20 },
    { status: 'ACCEPTED_BY_MARKETPLACE', daysAgoVal: 10 },
    { status: 'SHIPPED', daysAgoVal: 5 },
    { status: 'PICKING', daysAgoVal: 0 },
    { status: 'CREATED', daysAgoVal: 0 },
  ];
  for (const def of supplyStatuses) {
    const client = pick(clients);
    const products = (productsByClient.get(client.id) ?? []).slice(0, 2);
    if (products.length === 0) continue;
    const supplyDate = daysAgo(def.daysAgoVal, 9);

    const supply = await prisma.supply.create({
      data: {
        supplyNumber: nextSupplyNumber(),
        clientId: client.id,
        marketplace: Marketplace.WILDBERRIES,
        marketplaceWarehouse: 'Коледино',
        status: def.status as any,
        createdAt: supplyDate,
        boxesCount: randInt(1, 5),
        items: { create: products.map((p) => ({ productId: p.id, qtyNeeded: randInt(5, 20) })) },
      },
      include: { items: true },
    });

    if (['COMPLETED', 'ACCEPTED_BY_MARKETPLACE', 'SHIPPED'].includes(def.status)) {
      for (const item of supply.items) {
        await prisma.supplyItem.update({ where: { id: item.id }, data: { qtyPicked: item.qtyNeeded } });
        await shipProductHistorical(item.productId, item.qtyNeeded, supplyDate, `FBO поставка №${supply.supplyNumber}`);
      }
    }
    await prisma.supplyStatusHistory.create({ data: { supplyId: supply.id, status: def.status as any, createdAt: supplyDate } });
  }

  // ---------- Историчные приёмки ----------
  for (let i = 0; i < 10; i += 1) {
    const client = pick(clients);
    const products = (productsByClient.get(client.id) ?? []).slice(0, 2);
    if (products.length === 0) continue;
    const receiptDate = daysAgo(randInt(3, 40), 10);
    const expectedQty = randInt(20, 100);
    const discrepancy = Math.random() < 0.2 ? -randInt(1, 3) : 0;

    const receipt = await prisma.receipt.create({
      data: {
        clientId: client.id,
        warehouseId: warehouse.id,
        documentNumber: `ПР-${1000 + i}`,
        date: receiptDate,
        createdAt: receiptDate,
        expectedPlaces: randInt(1, 5),
        expectedItems: expectedQty,
        status: 'COMPLETED',
        items: {
          create: products.map((p) => ({
            productId: p.id,
            expectedQty: Math.round(expectedQty / products.length),
            actualQty: Math.round(expectedQty / products.length) + (p === products[0] ? discrepancy : 0),
            discrepancy: p === products[0] ? discrepancy : 0,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of receipt.items) {
      const existingStock = await prisma.stock.findFirst({ where: { productId: item.productId } });
      if (existingStock) {
        await prisma.stock.update({ where: { id: existingStock.id }, data: { physicalQty: { increment: item.actualQty } } });
      } else {
        await prisma.stock.create({
          data: { productId: item.productId, cellId: pick(allCells).id, clientId: client.id, physicalQty: item.actualQty },
        });
      }
      await prisma.productHistoryEntry.create({
        data: {
          productId: item.productId,
          delta: item.actualQty,
          reason: 'Приёмка',
          reference: `Приёмка №${receipt.documentNumber}`,
          userId: manager.id,
          createdAt: receiptDate,
        },
      });
    }
  }

  // ---------- Уведомления общего характера ----------
  const notifTypes: { type: any; title: string; message: string }[] = [
    { type: 'LOW_STOCK', title: 'Низкий остаток товара', message: 'По нескольким товарам остаток приближается к критическому.' },
    { type: 'NEW_ORDER', title: 'Новый заказ поступил', message: 'В систему поступил новый FBS-заказ от клиента.' },
    { type: 'SUPPLY_READY', title: 'Поставка готова к отгрузке', message: 'FBO-поставка полностью собрана и упакована.' },
  ];
  for (const n of notifTypes) {
    await prisma.notification.create({
      data: { ...n, isRead: Math.random() < 0.5, createdAt: daysAgo(randInt(0, 5)) },
    });
  }

  console.log('Демо-данные успешно загружены:');
  console.log(`  Клиентов: ${clients.length}`);
  console.log(`  Товаров: ${Array.from(productsByClient.values()).reduce((s, arr) => s + arr.length, 0)}`);
  console.log(`  Исторических заказов: ${totalHistoricalOrders}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
