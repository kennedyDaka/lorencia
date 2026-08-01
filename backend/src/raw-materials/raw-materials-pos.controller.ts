import { Controller, Get, Post, Patch, Body, Param } from "@nestjs/common";
import { RawMaterialsService } from "./raw-materials.service";

@Controller("pos/raw-materials")
export class RawMaterialsPosController {
  constructor(private readonly rawMaterialsService: RawMaterialsService) {}

  @Get("business/:businessId")
  findAllByBusiness(@Param("businessId") businessId: string) {
    return this.rawMaterialsService.findAllByBusiness(businessId);
  }

  @Post()
  create(@Body() dto: {
    businessId: string;
    name: string;
    category?: string;
    unit?: string;
    stockQty?: number;
    unitCost?: number;
    lowStockThreshold?: number;
  }) {
    return this.rawMaterialsService.create(dto);
  }

  @Post("purchase")
  recordPurchase(@Body() dto: {
    rawMaterialId: string;
    businessId: string;
    qtyAdded: number;
    unitCost: number;
    note?: string;
  }) {
    return this.rawMaterialsService.recordPurchase(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: {
    name?: string;
    category?: string;
    unit?: string;
    stockQty?: number;
    unitCost?: number;
    lowStockThreshold?: number;
  }) {
    return this.rawMaterialsService.update(id, dto);
  }
}
