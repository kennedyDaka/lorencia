import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsPosController } from "./products-pos.controller";
import { ProductsService } from "./products.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [ProductsController, ProductsPosController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
