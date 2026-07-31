import { IsString, IsOptional, IsUUID, IsEmail } from "class-validator";

export class CreateCustomerDto {
  @IsUUID()
  businessId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
