/**
 * Разовый скрипт: убрать демо-клиента "ИП Матаев" (заводится seed.ts при
 * каждом migrate reset) из локальной БД, оставив логин client@wb-fulfillment.local
 * рабочим (просто отвязываем от клиента, а не удаляем аккаунт).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const client = await prisma.client.findFirst({ where: { name: 'ИП Матаев' } });
  if (!client) {
    console.log('Клиент "ИП Матаев" не найден — нечего удалять.');
    return;
  }

  const products = await prisma.product.findMany({ where: { clientId: client.id } });
  const productIds = products.map((p) => p.id);

  await prisma.$transaction([
    prisma.stock.deleteMany({ where: { productId: { in: productIds } } }),
    prisma.productHistoryEntry.deleteMany({ where: { productId: { in: productIds } } }),
    prisma.product.deleteMany({ where: { clientId: client.id } }),
    prisma.clientRequisites.deleteMany({ where: { clientId: client.id } }),
    prisma.contract.deleteMany({ where: { clientId: client.id } }),
    prisma.user.updateMany({ where: { clientId: client.id }, data: { clientId: null } }),
    prisma.client.delete({ where: { id: client.id } }),
  ]);

  console.log(`Удалены: клиент "${client.name}" (${client.id}), ${products.length} товаров и связанные остатки/реквизиты/договор.`);
  console.log('Логин client@wb-fulfillment.local сохранён, но больше не привязан к клиенту.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
