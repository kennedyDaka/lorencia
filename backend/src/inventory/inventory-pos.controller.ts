import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { AdjustStockDto } from "./dto/adjust-stock.dto";

@Controller("pos/inventory")
export class InventoryPosController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get("low-stock")
  getLowStockProducts(@Query("businessId") businessId: string) {
    return this.inventoryService.getLowStockProducts(businessId);
  }

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

  @Post("adjust")
  adjustStock(@Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(dto);
  }
}
