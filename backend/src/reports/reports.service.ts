import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(businessId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [todaySales, monthSales, yearSales, todayExpenses, monthExpenses, yearExpenses, recentSales, rawMaterials] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { businessId, createdAt: { gte: startOfDay } },
        _sum: { total: true },
      }),
      this.prisma.sale.aggregate({
        where: { businessId, createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      this.prisma.sale.aggregate({
        where: { businessId, createdAt: { gte: startOfYear } },
        _sum: { total: true },
      }),
      this.prisma.expense.aggregate({
        where: { businessId, createdAt: { gte: startOfDay } },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { businessId, createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { businessId, createdAt: { gte: startOfYear } },
        _sum: { amount: true },
      }),
      this.prisma.sale.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { items: true },
      }),
      this.prisma.rawMaterial.findMany({
        where: { businessId, isActive: true },
        select: { id: true, stockQty: true, lowStockThreshold: true },
      }),
    ]);

    const lowStockCount = rawMaterials.filter(
      (rm) => Number(rm.stockQty) < Number(rm.lowStockThreshold),
    ).length;

    return {
      totalRevenue: {
        today: todaySales._sum.total ?? 0,
        thisMonth: monthSales._sum.total ?? 0,
        thisYear: yearSales._sum.total ?? 0,
      },
      totalExpenses: {
        today: todayExpenses._sum.amount ?? 0,
        thisMonth: monthExpenses._sum.amount ?? 0,
        thisYear: yearExpenses._sum.amount ?? 0,
      },
      recentSales,
      lowStockCount,
    };
  }

  async getProfitAndLoss(businessId: string, from: Date, to: Date) {
    const [salesAggregate, expenses] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { businessId, createdAt: { gte: from, lte: to } },
        _sum: { total: true },
      }),
      this.prisma.expense.groupBy({
        by: ["category"],
        where: { businessId, createdAt: { gte: from, lte: to } },
        _sum: { amount: true },
      }),
    ]);

    const revenue = salesAggregate._sum.total ?? 0;
    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e._sum.amount ?? 0), 0);

    return {
      revenue,
      expenses: expenses.map((e) => ({
        category: e.category,
        total: e._sum.amount ?? 0,
      })),
      totalExpenses,
      netProfit: Number(revenue) - totalExpenses,
    };
  }

  async getSalesReport(businessId: string, from: Date, to: Date) {
    const [totalAggregate, byPaymentMethod, topProducts] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { businessId, createdAt: { gte: from, lte: to } },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.sale.groupBy({
        by: ["paymentMethod"],
        where: { businessId, createdAt: { gte: from, lte: to } },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.$queryRaw`
        SELECT si."productId", p."name" as "productName",
               SUM(si."qty" * si."unitPrice")::float as "revenue",
               SUM(si."qty")::float as "count"
        FROM "SaleItem" si
        JOIN "Sale" s ON si."saleId" = s."id"
        LEFT JOIN "Product" p ON si."productId" = p."id"
        WHERE s."businessId" = ${businessId}
          AND s."createdAt" >= ${from}
          AND s."createdAt" <= ${to}
        GROUP BY si."productId", p."name"
        ORDER BY "revenue" DESC
        LIMIT 5
      `,
    ]);

    return {
      totalSales: totalAggregate._sum.total ?? 0,
      totalCount: totalAggregate._count,
      byPaymentMethod: byPaymentMethod.map((pm) => ({
        method: pm.paymentMethod,
        total: pm._sum.total ?? 0,
        count: pm._count,
      })),
      topProducts,
    };
  }

  async getExpenseReport(businessId: string, from: Date, to: Date) {
    const [totalAggregate, byCategory] = await Promise.all([
      this.prisma.expense.aggregate({
        where: { businessId, createdAt: { gte: from, lte: to } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.expense.groupBy({
        by: ["category"],
        where: { businessId, createdAt: { gte: from, lte: to } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      totalExpenses: totalAggregate._sum.amount ?? 0,
      byCategory: byCategory.map((c) => ({
        category: c.category,
        total: c._sum.amount ?? 0,
        count: c._count,
      })),
    };
  }
}
