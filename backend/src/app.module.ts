import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { BusinessesModule } from "./businesses/businesses.module";
import { ProductsModule } from "./products/products.module";
import { SalesModule } from "./sales/sales.module";
import { InventoryModule } from "./inventory/inventory.module";
import { CustomersModule } from "./customers/customers.module";
import { ExpensesModule } from "./expenses/expenses.module";
import { CateringModule } from "./catering/catering.module";
import { RawMaterialsModule } from "./raw-materials/raw-materials.module";
import { AccountingModule } from "./accounting/accounting.module";
import { ReportsModule } from "./reports/reports.module";
import { PayrollModule } from "./payroll/payroll.module";
import { UsersModule } from "./users/users.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    BusinessesModule,
    ProductsModule,
    SalesModule,
    InventoryModule,
    CustomersModule,
    ExpensesModule,
    CateringModule,
    RawMaterialsModule,
    AccountingModule,
    ReportsModule,
    PayrollModule,
    UsersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
