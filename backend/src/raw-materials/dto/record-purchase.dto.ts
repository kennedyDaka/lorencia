import { IsString, IsNumber, IsOptional, Min } from "class-validator";

export class RecordPurchaseDto {
  @IsString()
  rawMaterialId: string;

  @IsString()
  businessId: string;

  @IsNumber()
  @Min(0.01)
  qtyAdded: number;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsString()
  @IsOptional()
  note?: string;
}
