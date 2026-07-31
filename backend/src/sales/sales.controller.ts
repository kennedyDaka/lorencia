import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { SalesService } from "./sales.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("sales")
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.salesService.getSaleById(id);
  }

  @Get("business/:businessId")
  findByBusiness(
    @Param("businessId") businessId: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("limit") limit?: string,
  ) {
    return this.salesService.getSalesByBusiness(businessId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }
}
