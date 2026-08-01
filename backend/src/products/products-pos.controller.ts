import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { ProductsService } from "./products.service";

@Controller("pos/products")
export class ProductsPosController {
  constructor(private productsService: ProductsService) {}

  @Get(":businessId")
  findAll(@Param("businessId") businessId: string) {
    return this.productsService.findAllPublic(businessId);
  }

  @Post()
  create(@Body() dto: {
    businessId: string;
    name: string;
    price: number;
    stockQty: number;
    lowStockThreshold?: number;
    category?: string;
  }) {
    return this.productsService.createPublic(dto);
  }

  @Patch()
  update(@Body() dto: {
    id: string;
    name?: string;
    price?: number;
    stockQty?: number;
    lowStockThreshold?: number;
    category?: string;
    isActive?: boolean;
  }) {
    return this.productsService.updatePublic(dto);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.productsService.deleteProduct(id);
  }
}
