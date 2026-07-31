import { Controller } from "@nestjs/common";
import { RawMaterialsService } from "./raw-materials.service";

@Controller("raw-materials")
export class RawMaterialsController {
  constructor(private readonly rawMaterialsService: RawMaterialsService) {}
}
