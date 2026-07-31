import { Controller, Get, Param } from "@nestjs/common";
import { ProductsService } from "./products.service";

@Controller("pos/products")
export class ProductsPosController {
  constructor(private productsService: ProductsService) {}

  @Get(":businessId")
  findAll(@Param("businessId") businessId: string) {
    return this.productsService.findAllPublic(businessId);
  }
}
