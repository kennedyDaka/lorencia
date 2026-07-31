import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CustomersController } from "./customers.controller";
import { CustomersPosController } from "./customers-pos.controller";
import { CustomersService } from "./customers.service";

@Module({
  imports: [PrismaModule],
  controllers: [CustomersController, CustomersPosController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
