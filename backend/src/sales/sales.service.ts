import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

interface SaleItem {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
}

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async createSale(input: {
    businessId: string;
    items: SaleItem[];
    total: number;
    paymentMethod: string;
    customerId?: string;
    note?: string;
    cashierId?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validate business exists
      const biz = await tx.business.findUnique({ where: { id: input.businessId } });
      if (!biz) throw new NotFoundException("Business not found");

      // 2. Fetch products to get authoritative prices
      const productIds = input.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, businessId: input.businessId },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      // 3. Validate all products exist, belong to business, and are active
      for (const item of input.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new BadRequestException(`Product ${item.productName} not found`);
        }
        if (!product.isActive) {
          throw new BadRequestException(`Product ${item.productName} is no longer active`);
        }
      }

      // 4. Recalculate total from DB prices
      let computedTotal = 0;
      const validatedItems = input.items.map((item) => {
        const product = productMap.get(item.productId)!;
        const unitPrice = Number(product.price);
        computedTotal += unitPrice * item.qty;
        return {
          productId: item.productId,
          productName: item.productName,
          qty: item.qty,
          unitPrice,
        };
      });

      // 5. Insert sale
      const sale = await tx.sale.create({
        data: {
          businessId: input.businessId,
          total: computedTotal,
          paymentMethod: input.paymentMethod,
          customerId: input.customerId ?? null,
          note: input.note ?? null,
          cashierId: input.cashierId ?? null,
        },
      });

      // 6. Insert sale items
      await tx.saleItem.createMany({
        data: validatedItems.map((item) => ({
          saleId: sale.id,
          ...item,
        })),
      });

      // 7. Decrement stock (with rollback on failure)
      for (const item of validatedItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product) {
          const currentStock = Number(product.stockQty);
          if (currentStock > 0) {
            const newQty = Math.max(0, currentStock - item.qty);
            await tx.product.update({
              where: { id: item.productId },
              data: { stockQty: newQty },
            });

            // Log stock movement
            await tx.stockMovement.create({
              data: {
                businessId: input.businessId,
                inventoryType: "product",
                productId: item.productId,
                qtyChange: -item.qty,
                previousQty: currentStock,
                newQty,
                reason: "sale",
              },
            });
          }
        }
      }

      return { id: sale.id, total: computedTotal };
    });
  }

  async getSaleById(id: string) {
    return this.prisma.sale.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async getSalesByBusiness(businessId: string, options?: { from?: Date; to?: Date; limit?: number }) {
    const where: Record<string, unknown> = { businessId };
    if (options?.from || options?.to) {
      where.createdAt = {
        ...(options.from ? { gte: options.from } : {}),
        ...(options.to ? { lte: options.to } : {}),
      };
    }

    return this.prisma.sale.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 100,
    });
  }
}
