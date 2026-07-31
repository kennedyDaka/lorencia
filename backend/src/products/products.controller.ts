import { Controller, Get, Post, Patch, Body, Param, UseGuards } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { UserPayload } from "../auth/guards/jwt-auth.guard";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Controller("products")
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get(":businessId")
  findAll(@Param("businessId") businessId: string, @CurrentUser() user: UserPayload) {
    return this.productsService.findAll(businessId, user.userId);
  }

  @Post()
  create(@Body() dto: CreateProductDto, @CurrentUser() user: UserPayload) {
    return this.productsService.create(dto, user.userId);
  }

  @Patch()
  update(@Body() dto: UpdateProductDto, @CurrentUser() user: UserPayload) {
    return this.productsService.update(dto, user.userId);
  }

  @Patch("toggle-active")
  toggleActive(
    @Body("id") id: string,
    @Body("isActive") isActive: boolean,
    @CurrentUser() user: UserPayload,
  ) {
    return this.productsService.toggleActive(id, isActive, user.userId);
  }
}
