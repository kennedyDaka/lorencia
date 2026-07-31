import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

interface CreateExpenseInput {
  businessId: string;
  category: string;
  amount: number;
  note?: string;
  createdBy?: string;
}

interface CreateItemizedExpenseInput {
  businessId: string;
  category: string;
  items: Array<{
    description: string;
    qty: number;
    unit?: string;
    unitPrice: number;
    total: number;
  }>;
  note?: string;
  createdBy?: string;
}

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async createExpense(input: CreateExpenseInput) {
    const biz = await this.prisma.business.findUnique({ where: { id: input.businessId } });
    if (!biz) throw new NotFoundException("Business not found");

    const expense = await this.prisma.expense.create({
      data: {
        businessId: input.businessId,
        category: input.category,
        amount: input.amount,
        note: input.note ?? null,
        createdBy: input.createdBy ?? null,
      },
    });

    return expense;
  }

  async createItemizedExpense(input: CreateItemizedExpenseInput) {
    const biz = await this.prisma.business.findUnique({ where: { id: input.businessId } });
    if (!biz) throw new NotFoundException("Business not found");

    const total = input.items.reduce((sum, item) => sum + item.total, 0);

    const expense = await this.prisma.$transaction(async (tx) => {
      const created = await tx.expense.create({
        data: {
          businessId: input.businessId,
          category: input.category,
          amount: total,
          note: input.note ?? null,
          createdBy: input.createdBy ?? null,
        },
      });

      await tx.expenseItem.createMany({
        data: input.items.map((item) => ({
          expenseId: created.id,
          description: item.description,
          qty: item.qty,
          unit: item.unit ?? null,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      });

      return created;
    });

    return expense;
  }

  async getExpensesByBusiness(
    businessId: string,
    options?: { from?: Date; to?: Date; limit?: number },
  ) {
    const where: Record<string, unknown> = { businessId };
    if (options?.from || options?.to) {
      where.createdAt = {
        ...(options.from ? { gte: options.from } : {}),
        ...(options.to ? { lte: options.to } : {}),
      };
    }

    return this.prisma.expense.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 100,
    });
  }
}
