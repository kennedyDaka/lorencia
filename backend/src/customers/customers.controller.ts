import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@Controller("customers")
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get("business/:businessId")
  findAll(@Param("businessId") businessId: string) {
    return this.customersService.findAll(businessId);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.customersService.findById(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body()
    input: { name?: string; phone?: string; email?: string; notes?: string },
  ) {
    return this.customersService.update(id, input);
  }
}
