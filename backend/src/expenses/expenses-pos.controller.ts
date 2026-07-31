import { Controller, Post, Body } from "@nestjs/common";
import { ExpensesService } from "./expenses.service";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { CreateItemizedExpenseDto } from "./dto/create-itemized-expense.dto";

@Controller("pos/expenses")
export class ExpensesPosController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.createExpense(dto);
  }

  @Post("itemized")
  createItemized(@Body() dto: CreateItemizedExpenseDto) {
    return this.expensesService.createItemizedExpense(dto);
  }
}
