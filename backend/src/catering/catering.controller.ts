import { Controller } from "@nestjs/common";
import { CateringService } from "./catering.service";

@Controller("catering")
export class CateringController {
  constructor(private readonly cateringService: CateringService) {}
}
