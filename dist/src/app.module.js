"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const events_module_1 = require("./events/events.module");
const audit_log_module_1 = require("./audit-log/audit-log.module");
const notifications_module_1 = require("./notifications/notifications.module");
const settings_module_1 = require("./settings/settings.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const clients_module_1 = require("./clients/clients.module");
const products_module_1 = require("./products/products.module");
const warehouses_module_1 = require("./warehouses/warehouses.module");
const stock_module_1 = require("./stock/stock.module");
const receipts_module_1 = require("./receipts/receipts.module");
const movements_module_1 = require("./movements/movements.module");
const inventory_module_1 = require("./inventory/inventory.module");
const packaging_module_1 = require("./packaging/packaging.module");
const orders_module_1 = require("./orders/orders.module");
const fbo_module_1 = require("./fbo/fbo.module");
const shipments_module_1 = require("./shipments/shipments.module");
const pricing_module_1 = require("./pricing/pricing.module");
const debts_module_1 = require("./debts/debts.module");
const marketplaces_module_1 = require("./marketplaces/marketplaces.module");
const telegram_module_1 = require("./telegram/telegram.module");
const documents_module_1 = require("./documents/documents.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const analytics_module_1 = require("./analytics/analytics.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'storage'),
                serveRoot: '/storage',
            }),
            prisma_module_1.PrismaModule,
            events_module_1.EventsModule,
            audit_log_module_1.AuditLogModule,
            notifications_module_1.NotificationsModule,
            settings_module_1.SettingsModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            clients_module_1.ClientsModule,
            products_module_1.ProductsModule,
            warehouses_module_1.WarehousesModule,
            stock_module_1.StockModule,
            receipts_module_1.ReceiptsModule,
            movements_module_1.MovementsModule,
            inventory_module_1.InventoryModule,
            packaging_module_1.PackagingModule,
            orders_module_1.OrdersModule,
            fbo_module_1.FboModule,
            shipments_module_1.ShipmentsModule,
            pricing_module_1.PricingModule,
            debts_module_1.DebtsModule,
            marketplaces_module_1.MarketplacesModule,
            telegram_module_1.TelegramModule,
            documents_module_1.DocumentsModule,
            dashboard_module_1.DashboardModule,
            analytics_module_1.AnalyticsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
            { provide: core_1.APP_FILTER, useClass: http_exception_filter_1.AllExceptionsFilter },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map