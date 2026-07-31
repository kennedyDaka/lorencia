import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PayrollService } from "./payroll.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { GeneratePayrollDto } from "./dto/generate-payroll.dto";

@Controller("payroll")
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post("employees")
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.payrollService.createEmployee(dto);
  }

  @Get("employees/business/:businessId")
  getEmployees(@Param("businessId") businessId: string) {
    return this.payrollService.getEmployees(businessId);
  }

  @Patch("employees/:id")
  updateEmployee(
    @Param("id") id: string,
    @Body() input: { name?: string; position?: string; baseSalary?: number; isActive?: boolean },
  ) {
    return this.payrollService.updateEmployee(id, input);
  }

  @Post("entries")
  generatePayroll(@Body() dto: GeneratePayrollDto) {
    return this.payrollService.generatePayroll(dto);
  }

  @Get("entries/business/:businessId")
  getPayrollEntries(@Param("businessId") businessId: string) {
    return this.payrollService.getPayrollEntries(businessId);
  }

  @Patch("entries/:id/pay")
  markPaid(@Param("id") id: string) {
    return this.payrollService.markPaid(id);
  }

  @Get("settings/business/:businessId")
  getSettings(@Param("businessId") businessId: string) {
    return this.payrollService.getSettings(businessId);
  }

  @Patch("settings/business/:businessId")
  updateSettings(
    @Param("businessId") businessId: string,
    @Body() dto: { defaultPensionPercentage?: number; defaultOvertimeRate?: number; standardHoursPerPeriod?: number },
  ) {
    return this.payrollService.updateSettings(businessId, dto);
  }
}
