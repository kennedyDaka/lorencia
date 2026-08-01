import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string, userId: string) {
    await this.verifyAccess(businessId, userId);

    return this.prisma.product.findMany({
      where: { businessId },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  }

  async findAllPublic(businessId: string) {
    return this.prisma.product.findMany({
      where: { businessId, isActive: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        stockQty: true,
        lowStockThreshold: true,
        isActive: true,
      },
    });
  }

  async create(input: {
    businessId: string;
    name: string;
    price: number;
    stockQty: number;
    lowStockThreshold?: number;
    category?: string;
  }, userId: string) {
    await this.verifyAccess(input.businessId, userId);

    return this.prisma.product.create({
      data: {
        businessId: input.businessId,
        name: input.name,
        price: input.price,
        stockQty: input.stockQty,
        lowStockThreshold: input.lowStockThreshold ?? 5,
        category: input.category ?? null,
      },
    });
  }

  async update(input: {
    id: string;
    name?: string;
    price?: number;
    stockQty?: number;
    lowStockThreshold?: number;
    category?: string;
    isActive?: boolean;
  }, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: input.id } });
    if (!product) throw new NotFoundException("Product not found");

    await this.verifyAccess(product.businessId, userId);

    const { id, ...updates } = input;
    return this.prisma.product.update({ where: { id }, data: updates });
  }

  async toggleActive(id: string, isActive: boolean, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Product not found");

    await this.verifyAccess(product.businessId, userId);

    return this.prisma.product.update({
      where: { id },
      data: { isActive },
    });
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Product not found");
    return this.prisma.product.delete({ where: { id } });
  }

  async createPublic(input: {
    businessId: string;
    name: string;
    price: number;
    stockQty: number;
    lowStockThreshold?: number;
    category?: string;
  }) {
    return this.prisma.product.create({
      data: {
        businessId: input.businessId,
        name: input.name,
        price: input.price,
        stockQty: input.stockQty,
        lowStockThreshold: input.lowStockThreshold ?? 5,
        category: input.category ?? null,
      },
    });
  }

  async updatePublic(input: {
    id: string;
    name?: string;
    price?: number;
    stockQty?: number;
    lowStockThreshold?: number;
    category?: string;
    isActive?: boolean;
  }) {
    const product = await this.prisma.product.findUnique({ where: { id: input.id } });
    if (!product) throw new NotFoundException("Product not found");
    const { id, ...updates } = input;
    return this.prisma.product.update({ where: { id }, data: updates });
  }

  private async verifyAccess(businessId: string, userId: string) {
    const role = await this.prisma.userRole.findFirst({
      where: {
        userId,
        OR: [
          { businessId: null },
          { businessId },
        ],
      },
    });

    if (!role) {
      throw new ForbiddenException("You don't have access to this business");
    }
  }
}
