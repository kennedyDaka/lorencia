import { Controller, Get, Post, Patch, Body, Param } from "@nestjs/common";
import { CateringService } from "./catering.service";

@Controller("pos/catering")
export class CateringPosController {
  constructor(private readonly cateringService: CateringService) {}

  @Get("business/:businessId")
  findAllByBusiness(@Param("businessId") businessId: string) {
    return this.cateringService.findAllByBusiness(businessId);
  }

  @Post()
  createEvent(@Body() dto: {
    businessId: string;
    customerId?: string;
    eventDate: string | Date;
    venue?: string;
    guests: number;
    quotedAmount: number;
    depositPaid?: number;
    notes?: string;
  }) {
    return this.cateringService.createEvent({
      ...dto,
      eventDate: new Date(dto.eventDate),
    });
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body("status") status: string) {
    return this.cateringService.updateStatus(id, status);
  }
}
