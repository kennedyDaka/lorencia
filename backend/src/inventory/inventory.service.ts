import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getStockMovements(
    businessId: string,
    options?: { productId?: string; from?: Date; to?: Date; limit?: number },
  ) {
    const where: Record<string, unknown> = { businessId };

    if (options?.productId) {
      where.productId = options.productId;
    }

    if (options?.from || options?.to) {
      where.createdAt = {
        ...(options.from && { gte: options.from }),
        ...(options.to && { lte: options.to }),
      };
    }

    return this.prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 50,
      include: { product: { select: { id: true, name: true } } },
    });
  }

  async adjustStock(input: {
    businessId: string;
    productId: string;
    newQty: number;
    reason: string;
    note?: string;
  }) {
    const product = await this.prisma.product.findFirst({
      where: { id: input.productId, businessId: input.businessId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const previousQty = Number(product.stockQty);
    const qtyChange = input.newQty - previousQty;

    const [updatedProduct, stockMovement] = await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id: input.productId },
        data: { stockQty: input.newQty },
      }),
      this.prisma.stockMovement.create({
        data: {
          businessId: input.businessId,
          productId: input.productId,
          inventoryType: "product",
          qtyChange,
          previousQty,
          newQty: input.newQty,
          reason: input.reason,
          note: input.note,
        },
      }),
    ]);

    return { product: updatedProduct, stockMovement };
  }

  async getLowStockProducts(businessId: string) {
    return this.prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        stockQty: number;
        lowStockThreshold: number;
      }>
    >`
      SELECT id, name, stock_qty AS "stockQty", low_stock_threshold AS "lowStockThreshold"
      FROM products
      WHERE business_id = ${businessId}
        AND is_active = true
        AND stock_qty <= low_stock_threshold
    `;
  }
}
