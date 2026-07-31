import { IsString, IsNotEmpty, IsOptional, IsNumber } from "class-validator";

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  businessId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  @IsOptional()
  baseSalary?: number;
}
