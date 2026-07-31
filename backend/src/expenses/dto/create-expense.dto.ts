import { IsString, IsNumber, IsOptional, Min } from "class-validator";

export class CreateExpenseDto {
  @IsString()
  businessId: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  createdBy?: string;
}
