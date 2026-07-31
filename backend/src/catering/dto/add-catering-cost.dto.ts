import { IsString, IsNumber, IsOptional, Min } from "class-validator";

export class AddCateringCostDto {
  @IsString()
  cateringEventId: string;

  @IsString()
  businessId: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  category?: string;
}
