import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CateringController } from "./catering.controller";
import { CateringPosController } from "./catering-pos.controller";
import { CateringService } from "./catering.service";

@Module({
  imports: [PrismaModule],
  controllers: [CateringController, CateringPosController],
  providers: [CateringService],
  exports: [CateringService],
})
export class CateringModule {}
