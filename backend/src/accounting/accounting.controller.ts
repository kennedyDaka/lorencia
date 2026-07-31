import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common"
import { AccountingService } from "./accounting.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { CreateAccountDto } from "./dto/create-account.dto"
import { CreateJournalEntryDto } from "./dto/create-journal-entry.dto"

@Controller("accounting")
@UseGuards(JwtAuthGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Post("accounts")
  createAccount(@Body() dto: CreateAccountDto) {
    return this.accountingService.createAccount(dto)
  }

  @Get("accounts/business/:businessId")
  getChartOfAccounts(@Param("businessId") businessId: string) {
    return this.accountingService.getChartOfAccounts(businessId)
  }

  @Post("journal")
  createJournalEntry(@Body() dto: CreateJournalEntryDto) {
    return this.accountingService.createJournalEntry({
      ...dto,
      entryDate: new Date(dto.entryDate),
    })
  }

  @Get("journal/business/:businessId")
  getJournalEntries(
    @Param("businessId") businessId: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.accountingService.getJournalEntries(businessId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    })
  }

  @Get("trial-balance/business/:businessId")
  getTrialBalance(@Param("businessId") businessId: string) {
    return this.accountingService.getTrialBalance(businessId)
  }
}
