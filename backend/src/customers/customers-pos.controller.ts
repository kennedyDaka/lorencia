import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@Controller("pos/customers")
export class CustomersPosController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get("business/:businessId")
  findAll(@Param("businessId") businessId: string) {
    return this.customersService.findAll(businessId);
  }
}
