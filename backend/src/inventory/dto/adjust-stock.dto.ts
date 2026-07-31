import { IsUUID, IsNumber, IsString, IsOptional, Min } from "class-validator";

export class AdjustStockDto {
  @IsUUID()
  businessId: string;

  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0)
  newQty: number;

  @IsString()
  reason: string;

  @IsString()
  @IsOptional()
  note?: string;
}
