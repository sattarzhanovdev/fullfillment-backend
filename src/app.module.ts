import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { StockModule } from './stock/stock.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { MovementsModule } from './movements/movements.module';
import { InventoryModule } from './inventory/inventory.module';
import { PackagingModule } from './packaging/packaging.module';
import { OrdersModule } from './orders/orders.module';
import { FboModule } from './fbo/fbo.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { PricingModule } from './pricing/pricing.module';
import { DebtsModule } from './debts/debts.module';
import { MarketplacesModule } from './marketplaces/marketplaces.module';
import { TelegramModule } from './telegram/telegram.module';
import { DocumentsModule } from './documents/documents.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'storage'),
      serveRoot: '/storage',
    }),
    PrismaModule,
    EventsModule,
    AuditLogModule,
    NotificationsModule,
    SettingsModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    ProductsModule,
    WarehousesModule,
    StockModule,
    ReceiptsModule,
    MovementsModule,
    InventoryModule,
    PackagingModule,
    OrdersModule,
    FboModule,
    ShipmentsModule,
    PricingModule,
    DebtsModule,
    MarketplacesModule,
    TelegramModule,
    DocumentsModule,
    DashboardModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
