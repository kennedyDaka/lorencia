import { Controller, Post, Body } from "@nestjs/common";
import { SalesService } from "./sales.service";
import { CreateSaleDto } from "./dto/create-sale.dto";

@Controller("pos/sales")
export class SalesPosController {
  constructor(private salesService: SalesService) {}

  @Post()
  create(@Body() dto: CreateSaleDto) {
    return this.salesService.createSale({
      ...dto,
      // Public POS, no cashier identity
    });
  }
}
