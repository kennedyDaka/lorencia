import { IsString, IsNumber, IsOptional, IsDate, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateCateringEventDto {
  @IsString()
  businessId: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsDate()
  @Type(() => Date)
  eventDate: Date;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsNumber()
  @Min(1)
  guests: number;

  @IsNumber()
  @Min(0)
  quotedAmount: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  depositPaid?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
