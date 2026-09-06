/**
 * Быстрая проверка ключа WB API на реальных данных, в обход основного
 * приложения (без базы/бэкенда). Использование:
 *
 *   WB_API_KEY="..." npx ts-node --transpile-only scripts/test-wb-api.ts
 */
import { WildberriesAdapter } from '../src/marketplaces/adapters/wildberries.adapter';

async function main() {
  const apiKey = process.env.WB_API_KEY;
  if (!apiKey) {
    console.error('Задайте WB_API_KEY в окружении, например:\n  WB_API_KEY="..." npx ts-node --transpile-only scripts/test-wb-api.ts');
    process.exit(1);
  }

  const adapter = new WildberriesAdapter();

  console.log('\n=== fetchOrders (новые FBS-заказы) ===');
  try {
    const orders = await adapter.fetchOrders(apiKey);
    console.log(`Получено заказов: ${orders.length}`);
    console.log(orders.slice(0, 5));
  } catch (e) {
    console.error('Ошибка:', (e as Error).message);
  }

  console.log('\n=== fetchStock (остатки) ===');
  try {
    const stock = await adapter.fetchStock(apiKey);
    console.log(`Получено записей остатков: ${stock.length}`);
    console.log(stock.slice(0, 5));
  } catch (e) {
    console.error('Ошибка:', (e as Error).message);
  }

  console.log('\n=== fetchSupplies (поставки) ===');
  try {
    const supplies = await adapter.fetchSupplies(apiKey);
    console.log(`Получено поставок: ${supplies.length}`);
    console.log(supplies.slice(0, 5));
  } catch (e) {
    console.error('Ошибка:', (e as Error).message);
  }
}

main();
