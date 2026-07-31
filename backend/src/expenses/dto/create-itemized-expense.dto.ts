import { IsString, IsNumber, IsOptional, IsArray, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class ExpenseItemDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(1)
  qty: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  total: number;
}

export class CreateItemizedExpenseDto {
  @IsString()
  businessId: string;

  @IsString()
  category: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseItemDto)
  items: ExpenseItemDto[];

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  createdBy?: string;
}
