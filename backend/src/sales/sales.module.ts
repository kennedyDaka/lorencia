import { Module } from "@nestjs/common";
import { SalesController } from "./sales.controller";
import { SalesPosController } from "./sales-pos.controller";
import { SalesService } from "./sales.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [SalesController, SalesPosController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
