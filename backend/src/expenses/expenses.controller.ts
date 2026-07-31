import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ExpensesService } from "./expenses.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { CreateItemizedExpenseDto } from "./dto/create-itemized-expense.dto";

@Controller("expenses")
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.createExpense(dto);
  }

  @Post("itemized")
  createItemized(@Body() dto: CreateItemizedExpenseDto) {
    return this.expensesService.createItemizedExpense(dto);
  }

  @Get("business/:businessId")
  findByBusiness(
    @Param("businessId") businessId: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("limit") limit?: string,
  ) {
    return this.expensesService.getExpensesByBusiness(businessId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }
}
