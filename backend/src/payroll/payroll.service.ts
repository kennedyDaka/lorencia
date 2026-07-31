import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(input: {
    businessId: string;
    name: string;
    position?: string;
    baseSalary?: number;
  }) {
    return this.prisma.employee.create({ data: input });
  }

  async getEmployees(businessId: string) {
    return this.prisma.employee.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateEmployee(
    id: string,
    input: {
      name?: string;
      position?: string;
      baseSalary?: number;
      isActive?: boolean;
    },
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });
    if (!employee) throw new NotFoundException("Employee not found");
    return this.prisma.employee.update({ where: { id }, data: input });
  }

  async generatePayroll(input: {
    businessId: string;
    employeeId: string;
    payPeriodStart: string;
    payPeriodEnd: string;
    overtimeHours?: number;
  }) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: input.employeeId },
    });
    if (!employee) throw new NotFoundException("Employee not found");

    const grossPay = Number(employee.baseSalary);
    const overtimeRate = Number(employee.overtimeRate);
    const overtimeHours = input.overtimeHours ?? 0;
    const overtimePay = Math.round(overtimeHours * (grossPay / 176) * overtimeRate * 100) / 100;

    let pensionDeduction = 0;
    if (employee.pensionEligible && employee.pensionPercentage) {
      pensionDeduction = Math.round(grossPay * Number(employee.pensionPercentage) / 100 * 100) / 100;
    }

    const taxableAmount = Math.max(0, grossPay - pensionDeduction);
    const payeeTax = Math.round(taxableAmount * 0.15 * 100) / 100;

    const netPay = Math.round((grossPay + overtimePay - pensionDeduction - payeeTax) * 100) / 100;

    return this.prisma.payrollEntry.create({
      data: {
        businessId: input.businessId,
        employeeId: input.employeeId,
        payPeriodStart: new Date(input.payPeriodStart),
        payPeriodEnd: new Date(input.payPeriodEnd),
        grossPay,
        overtimeHours,
        overtimePay,
        pensionDeduction,
        payeeTax,
        netPay,
      },
      include: { employee: true },
    });
  }

  async getPayrollEntries(businessId: string) {
    return this.prisma.payrollEntry.findMany({
      where: { businessId },
      include: { employee: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async markPaid(id: string) {
    const entry = await this.prisma.payrollEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException("Payroll entry not found");
    return this.prisma.payrollEntry.update({
      where: { id },
      data: { status: "paid", paidAt: new Date() },
    });
  }

  async getSettings(businessId: string) {
    const existing = await this.prisma.payrollSettings.findUnique({
      where: { businessId },
    });
    if (existing) return existing;

    return this.prisma.payrollSettings.create({
      data: { businessId },
    });
  }

  async updateSettings(
    businessId: string,
    input: { defaultPensionPercentage?: number; defaultOvertimeRate?: number; standardHoursPerPeriod?: number },
  ) {
    await this.getSettings(businessId);
    return this.prisma.payrollSettings.update({
      where: { businessId },
      data: input,
    });
  }
}
