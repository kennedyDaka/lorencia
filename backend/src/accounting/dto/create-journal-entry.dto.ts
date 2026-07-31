import { IsString, IsNumber, IsArray, IsOptional, Min, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

class JournalLineDto {
  @IsString()
  accountCode: string

  @IsNumber()
  @Min(0)
  @IsOptional()
  debit?: number

  @IsNumber()
  @Min(0)
  @IsOptional()
  credit?: number
}

export class CreateJournalEntryDto {
  @IsString()
  businessId: string

  @IsString()
  entryDate: string

  @IsString()
  description: string

  @IsString()
  @IsOptional()
  referenceType?: string

  @IsString()
  @IsOptional()
  referenceId?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  lines: JournalLineDto[]
}
