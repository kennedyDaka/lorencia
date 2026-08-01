import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RawMaterialsController } from "./raw-materials.controller";
import { RawMaterialsPosController } from "./raw-materials-pos.controller";
import { RawMaterialsService } from "./raw-materials.service";

@Module({
  imports: [PrismaModule],
  controllers: [RawMaterialsController, RawMaterialsPosController],
  providers: [RawMaterialsService],
  exports: [RawMaterialsService],
})
export class RawMaterialsModule {}
