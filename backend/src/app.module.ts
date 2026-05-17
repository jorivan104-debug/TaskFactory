import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { WorkSitesModule } from './work-sites/work-sites.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { BrandsModule } from './brands/brands.module';
import { SilhouettesModule } from './silhouettes/silhouettes.module';
import { PantoneColorsModule } from './pantone-colors/pantone-colors.module';
import { SizesModule } from './sizes/sizes.module';
import { UnitsOfMeasureModule } from './units-of-measure/units-of-measure.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { SuppliesModule } from './supplies/supplies.module';
import { SupplyTypesModule } from './supply-types/supply-types.module';
import { DevelopmentsModule } from './developments/developments.module';
import { ProductionOrdersModule } from './production-orders/production-orders.module';
import { WorkOrderTypesModule } from './work-order-types/work-order-types.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { InventoryModule } from './inventory/inventory.module';
import { PurchasingModule } from './purchasing/purchasing.module';
import { InternalOrdersModule } from './internal-orders/internal-orders.module';
import { EmployeesModule } from './employees/employees.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { AccountingSyncModule } from './accounting-sync/accounting-sync.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    WorkSitesModule,
    WarehousesModule,
    BrandsModule,
    SilhouettesModule,
    PantoneColorsModule,
    SizesModule,
    UnitsOfMeasureModule,
    SuppliersModule,
    SuppliesModule,
    SupplyTypesModule,
    DevelopmentsModule,
    ProductionOrdersModule,
    WorkOrderTypesModule,
    WorkOrdersModule,
    InventoryModule,
    PurchasingModule,
    InternalOrdersModule,
    EmployeesModule,
    ShipmentsModule,
    AccountingSyncModule,
    ReportsModule,
    AuditModule,
    WebhooksModule,
  ],
})
export class AppModule {}
