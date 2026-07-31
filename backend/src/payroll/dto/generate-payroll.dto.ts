import { IsString, IsNotEmpty, IsOptional, IsNumber } from "class-validator";

export class GeneratePayrollDto {
  @IsString()
  @IsNotEmpty()
  businessId!: string;

  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @IsString()
  @IsNotEmpty()
  payPeriodStart!: string;

  @IsString()
  @IsNotEmpty()
  payPeriodEnd!: string;

  @IsNumber()
  @IsOptional()
  overtimeHours?: number;
}
