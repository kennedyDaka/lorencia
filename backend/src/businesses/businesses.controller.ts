import { Controller, Get, Param } from "@nestjs/common";
import { BusinessesService } from "./businesses.service";

@Controller("businesses")
export class BusinessesController {
  constructor(private businessesService: BusinessesService) {}

  @Get()
  findAll() {
    return this.businessesService.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.businessesService.findById(id);
  }
}
