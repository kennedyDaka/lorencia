import { IsString, IsNumber, IsOptional, IsUUID, Min } from "class-validator";

export class CreateProductDto {
  @IsUUID()
  businessId: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stockQty: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;

  @IsString()
  @IsOptional()
  category?: string;
}
