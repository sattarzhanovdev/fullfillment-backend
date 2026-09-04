"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const password = await bcrypt.hash('password123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@wb-fulfillment.local' },
        create: { email: 'admin@wb-fulfillment.local', passwordHash: password, fullName: 'Администратор', role: 'ADMIN' },
        update: {},
    });
    const director = await prisma.user.upsert({
        where: { email: 'director@wb-fulfillment.local' },
        create: {
            email: 'director@wb-fulfillment.local',
            passwordHash: password,
            fullName: 'Руководитель',
            role: 'DIRECTOR',
        },
        update: {},
    });
    const manager = await prisma.user.upsert({
        where: { email: 'manager@wb-fulfillment.local' },
        create: { email: 'manager@wb-fulfillment.local', passwordHash: password, fullName: 'Менеджер', role: 'MANAGER' },
        update: {},
    });
    await prisma.user.upsert({
        where: { email: 'storekeeper@wb-fulfillment.local' },
        create: {
            email: 'storekeeper@wb-fulfillment.local',
            passwordHash: password,
            fullName: 'Кладовщик',
            role: 'STOREKEEPER',
        },
        update: {},
    });
    await prisma.user.upsert({
        where: { email: 'packer@wb-fulfillment.local' },
        create: { email: 'packer@wb-fulfillment.local', passwordHash: password, fullName: 'Упаковщик', role: 'PACKER' },
        update: {},
    });
    let client = await prisma.client.findFirst({ where: { name: 'ИП Матаев' } });
    if (!client) {
        client = await prisma.client.create({
            data: { name: 'ИП Матаев', type: 'IP', managerId: manager.id, debtLimit: 10000 },
        });
    }
    await prisma.user.upsert({
        where: { email: 'client@wb-fulfillment.local' },
        create: {
            email: 'client@wb-fulfillment.local',
            passwordHash: password,
            fullName: 'ИП Матаев',
            role: 'CLIENT',
            clientId: client.id,
        },
        update: {},
    });
    await prisma.clientRequisites.upsert({
        where: { clientId: client.id },
        create: {
            clientId: client.id,
            legalName: 'ИП Матаев Арман Болатович',
            inn: '770123456789',
            ogrn: '318774600123456',
            legalAddress: 'г. Москва, ул. Складская, д. 1',
            phone: '+7 900 000-00-00',
            email: 'client@wb-fulfillment.local',
            contactPerson: 'Арман Матаев',
        },
        update: {},
    });
    await prisma.contract.upsert({
        where: { clientId: client.id },
        create: {
            clientId: client.id,
            number: 'Д-2026-001',
            date: new Date('2026-01-10'),
            startDate: new Date('2026-01-15'),
            termMonths: 12,
            tariff: 'Стандарт',
            status: 'ACTIVE',
        },
        update: {},
    });
    let warehouse = await prisma.warehouse.findFirst({ where: { name: 'Основной склад' } });
    if (!warehouse) {
        warehouse = await prisma.warehouse.create({ data: { name: 'Основной склад', address: 'г. Москва, ул. Складская, д. 10' } });
    }
    let zoneA = await prisma.zone.findFirst({ where: { warehouseId: warehouse.id, code: 'A' } });
    if (!zoneA) {
        zoneA = await prisma.zone.create({ data: { warehouseId: warehouse.id, code: 'A', name: 'Зона A' } });
    }
    let zoneReturns = await prisma.zone.findFirst({ where: { warehouseId: warehouse.id, code: 'RET' } });
    if (!zoneReturns) {
        zoneReturns = await prisma.zone.create({
            data: { warehouseId: warehouse.id, code: 'RET', name: 'Зона возвратов', isReturns: true },
        });
    }
    const cellCodes = ['A-01-01', 'A-01-02', 'A-01-03'];
    const cells = [];
    for (const code of cellCodes) {
        let cell = await prisma.cell.findFirst({ where: { zoneId: zoneA.id, code } });
        if (!cell) {
            cell = await prisma.cell.create({ data: { zoneId: zoneA.id, code, type: 'SHELF', capacity: 500 } });
        }
        cells.push(cell);
    }
    await prisma.priceRule.upsert({
        where: { id: (await prisma.priceRule.findFirst())?.id ?? '__none__' },
        create: { name: 'general', firstLiterPrice: 15, nextLiterPrice: 5 },
        update: { firstLiterPrice: 15, nextLiterPrice: 5 },
    });
    const packagingBag = await prisma.packagingType.upsert({
        where: { id: (await prisma.packagingType.findFirst({ where: { kind: 'пакет' } }))?.id ?? '__none__' },
        create: { name: 'Курьерский пакет', kind: 'пакет', cost: 5, maxVolumeL: 5 },
        update: {},
    });
    await prisma.packagingType.upsert({
        where: { id: (await prisma.packagingType.findFirst({ where: { kind: 'коробка' } }))?.id ?? '__none__' },
        create: { name: 'Коробка средняя', kind: 'коробка', cost: 25, maxVolumeL: 30 },
        update: {},
    });
    const productsData = [
        { name: 'Серьги "Луна"', sku: 'EAR-1', article: 'EAR-1', barcode: '2000000000015', l: 10, w: 8, h: 3, weight: 0.05 },
        { name: 'Кольцо "Волна"', sku: 'RING-2', article: 'RING-2', barcode: '2000000000022', l: 6, w: 6, h: 3, weight: 0.02 },
        { name: 'Браслет "Классик"', sku: 'BR-3', article: 'BR-3', barcode: '2000000000039', l: 15, w: 10, h: 4, weight: 0.08 },
    ];
    for (const p of productsData) {
        let product = await prisma.product.findFirst({ where: { clientId: client.id, article: p.article } });
        if (!product) {
            product = await prisma.product.create({
                data: {
                    clientId: client.id,
                    name: p.name,
                    sku: p.sku,
                    article: p.article,
                    barcode: p.barcode,
                    lengthCm: p.l,
                    widthCm: p.w,
                    heightCm: p.h,
                    weightKg: p.weight,
                    packagingTypeId: packagingBag.id,
                },
            });
        }
        const stock = await prisma.stock.findUnique({
            where: { productId_cellId: { productId: product.id, cellId: cells[0].id } },
        });
        if (!stock) {
            await prisma.stock.create({
                data: { productId: product.id, cellId: cells[0].id, clientId: client.id, physicalQty: 50 },
            });
        }
    }
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
    console.log('Seed завершён.');
    console.log('Логины (пароль для всех: password123):');
    console.log('  admin@wb-fulfillment.local (Администратор)');
    console.log('  director@wb-fulfillment.local (Руководитель)');
    console.log('  manager@wb-fulfillment.local (Менеджер)');
    console.log('  storekeeper@wb-fulfillment.local (Кладовщик)');
    console.log('  packer@wb-fulfillment.local (Упаковщик)');
    console.log('  client@wb-fulfillment.local (Клиент — ИП Матаев)');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map