import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const toNum = (v: unknown): number => Number(v ?? 0);

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
        today: toNum(todaySales._sum.total),
        thisMonth: toNum(monthSales._sum.total),
        thisYear: toNum(yearSales._sum.total),
      },
      totalExpenses: {
        today: toNum(todayExpenses._sum.amount),
        thisMonth: toNum(monthExpenses._sum.amount),
        thisYear: toNum(yearExpenses._sum.amount),
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

    const revenue = toNum(salesAggregate._sum.total);
    const totalExpenses = expenses.reduce((acc, e) => acc + toNum(e._sum.amount), 0);

    return {
      revenue,
      expenses: expenses.map((e) => ({
        category: e.category,
        total: toNum(e._sum.amount),
      })),
      totalExpenses,
      netProfit: revenue - totalExpenses,
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
      totalSales: toNum(totalAggregate._sum.total),
      totalCount: totalAggregate._count,
      byPaymentMethod: byPaymentMethod.map((pm) => ({
        method: pm.paymentMethod,
        total: toNum(pm._sum.total),
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
      totalExpenses: toNum(totalAggregate._sum.amount),
      byCategory: byCategory.map((c) => ({
        category: c.category,
        total: toNum(c._sum.amount),
        count: c._count,
      })),
    };
  }

  async getDetailedSales(businessId: string, from: Date, to: Date) {
    const sales = await this.prisma.sale.findMany({
      where: { businessId, createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        customer: { select: { name: true } },
      },
    });

    const rows = sales.map((s) => ({
      id: s.id,
      date: s.createdAt,
      customer: s.customer?.name ?? "Walk-in",
      paymentMethod: s.paymentMethod,
      total: toNum(s.total),
      itemCount: s.items.length,
      items: s.items.map((i) => ({
        productName: i.productName,
        qty: toNum(i.qty),
        unitPrice: toNum(i.unitPrice),
        lineTotal: toNum(i.qty) * toNum(i.unitPrice),
      })),
      note: s.note,
    }));

    const totalRevenue = rows.reduce((acc, r) => acc + r.total, 0);
    const totalItems = rows.reduce((acc, r) => acc + r.itemCount, 0);

    return { sales: rows, totalRevenue, totalSales: rows.length, totalItems };
  }

  async getDetailedExpenses(businessId: string, from: Date, to: Date) {
    const expenses = await this.prisma.expense.findMany({
      where: { businessId, createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    const rows = expenses.map((e) => ({
      id: e.id,
      date: e.createdAt,
      category: e.category,
      amount: toNum(e.amount),
      note: e.note,
      items: e.items.map((i) => ({
        description: i.description,
        qty: toNum(i.qty),
        unitPrice: toNum(i.unitPrice),
        lineTotal: toNum(i.qty) * toNum(i.unitPrice),
      })),
    }));

    const totalAmount = rows.reduce((acc, r) => acc + r.amount, 0);

    return { expenses: rows, totalExpenses: totalAmount, totalEntries: rows.length };
  }
}
