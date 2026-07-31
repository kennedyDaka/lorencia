import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RawMaterialsController } from "./raw-materials.controller";
import { RawMaterialsService } from "./raw-materials.service";

@Module({
  imports: [PrismaModule],
  controllers: [RawMaterialsController],
  providers: [RawMaterialsService],
  exports: [RawMaterialsService],
})
export class RawMaterialsModule {}
