import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ReportsService } from "./reports.service";

@Controller("reports")
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("dashboard/business/:businessId")
  getDashboard(@Param("businessId") businessId: string) {
    return this.reportsService.getDashboard(businessId);
  }

  @Get("pnl/business/:businessId")
  getProfitAndLoss(
    @Param("businessId") businessId: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), 0, 1);
    const toDate = to ? new Date(to) : new Date();
    return this.reportsService.getProfitAndLoss(businessId, fromDate, toDate);
  }

  @Get("sales/business/:businessId")
  getSalesReport(
    @Param("businessId") businessId: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), 0, 1);
    const toDate = to ? new Date(to) : new Date();
    return this.reportsService.getSalesReport(businessId, fromDate, toDate);
  }

  @Get("expenses/business/:businessId")
  getExpenseReport(
    @Param("businessId") businessId: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), 0, 1);
    const toDate = to ? new Date(to) : new Date();
    return this.reportsService.getExpenseReport(businessId, fromDate, toDate);
  }

  @Get("sales-detail/business/:businessId")
  getDetailedSales(
    @Param("businessId") businessId: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), 0, 1);
    const toDate = to ? new Date(to) : new Date();
    return this.reportsService.getDetailedSales(businessId, fromDate, toDate);
  }

  @Get("expenses-detail/business/:businessId")
  getDetailedExpenses(
    @Param("businessId") businessId: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), 0, 1);
    const toDate = to ? new Date(to) : new Date();
    return this.reportsService.getDetailedExpenses(businessId, fromDate, toDate);
  }
}
