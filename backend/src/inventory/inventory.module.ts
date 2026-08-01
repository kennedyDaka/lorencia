import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { InventoryController } from "./inventory.controller";
import { InventoryPosController } from "./inventory-pos.controller";
import { InventoryService } from "./inventory.service";

@Module({
  imports: [PrismaModule],
  controllers: [InventoryController, InventoryPosController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
