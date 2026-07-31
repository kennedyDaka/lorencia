import { Controller, Get, Post, Patch, Body, Param, UseGuards } from "@nestjs/common";
import { RawMaterialsService } from "./raw-materials.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateRawMaterialDto } from "./dto/create-raw-material.dto";
import { RecordPurchaseDto } from "./dto/record-purchase.dto";

@UseGuards(JwtAuthGuard)
@Controller("raw-materials")
export class RawMaterialsController {
  constructor(private readonly rawMaterialsService: RawMaterialsService) {}

  @Post()
  create(@Body() dto: CreateRawMaterialDto) {
    return this.rawMaterialsService.create(dto);
  }

  @Get("business/:businessId")
  findAllByBusiness(@Param("businessId") businessId: string) {
    return this.rawMaterialsService.findAllByBusiness(businessId);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.rawMaterialsService.findById(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: Partial<CreateRawMaterialDto>) {
    return this.rawMaterialsService.update(id, dto);
  }

  @Post("purchase")
  recordPurchase(@Body() dto: RecordPurchaseDto) {
    return this.rawMaterialsService.recordPurchase(dto);
  }
}
