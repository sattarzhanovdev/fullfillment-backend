import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MarketplacesService } from '../src/marketplaces/marketplaces.service';

async function main() {
  const integrationId = process.argv[2];
  if (!integrationId) {
    console.error('Usage: ts-node scripts/debug-sync.ts <integrationId>');
    process.exit(1);
  }
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const service = app.get(MarketplacesService);
  try {
    const result = await service.sync(integrationId);
    console.log('RESULT:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('SYNC FAILED:', e);
  }
  await app.close();
}

main();
