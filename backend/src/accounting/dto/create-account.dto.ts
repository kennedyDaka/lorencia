import { IsString, IsBoolean, IsOptional } from "class-validator"

export class CreateAccountDto {
  @IsString()
  businessId: string

  @IsString()
  code: string

  @IsString()
  name: string

  @IsString()
  type: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
