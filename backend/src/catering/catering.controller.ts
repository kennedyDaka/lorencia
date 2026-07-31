import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { CateringService } from "./catering.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateCateringEventDto } from "./dto/create-catering-event.dto";
import { AddCateringCostDto } from "./dto/add-catering-cost.dto";

@Controller("catering")
@UseGuards(JwtAuthGuard)
export class CateringController {
  constructor(private readonly cateringService: CateringService) {}

  @Post()
  createEvent(@Body() dto: CreateCateringEventDto) {
    return this.cateringService.createEvent(dto);
  }

  @Get("business/:businessId")
  findAllByBusiness(@Param("businessId") businessId: string) {
    return this.cateringService.findAllByBusiness(businessId);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.cateringService.findById(id);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body("status") status: string) {
    return this.cateringService.updateStatus(id, status);
  }

  @Post(":id/costs")
  addCost(@Param("id") id: string, @Body() dto: AddCateringCostDto) {
    return this.cateringService.addCost({ ...dto, cateringEventId: id });
  }
}
