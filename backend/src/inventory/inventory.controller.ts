import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdjustStockDto } from "./dto/adjust-stock.dto";

@UseGuards(JwtAuthGuard)
@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get("movements")
  getStockMovements(
    @Query("businessId") businessId: string,
    @Query("productId") productId?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("limit") limit?: string,
  ) {
    return this.inventoryService.getStockMovements(businessId, {
      productId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get("low-stock")
  getLowStockProducts(@Query("businessId") businessId: string) {
    return this.inventoryService.getLowStockProducts(businessId);
  }

  @Post("adjust")
  adjustStock(@Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(dto);
  }
}
