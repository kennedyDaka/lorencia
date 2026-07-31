import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RawMaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    businessId: string;
    name: string;
    category?: string;
    unit?: string;
    stockQty?: number;
    unitCost?: number;
    lowStockThreshold?: number;
  }) {
    return this.prisma.rawMaterial.create({
      data: {
        businessId: input.businessId,
        name: input.name,
        category: input.category,
        unit: input.unit ?? "kg",
        stockQty: input.stockQty ?? 0,
        unitCost: input.unitCost ?? 0,
        lowStockThreshold: input.lowStockThreshold ?? 5,
      },
    });
  }

  async findAllByBusiness(businessId: string) {
    return this.prisma.rawMaterial.findMany({
      where: { businessId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const material = await this.prisma.rawMaterial.findUnique({ where: { id } });
    if (!material) throw new NotFoundException("Raw material not found");
    return material;
  }

  async update(
    id: string,
    input: {
      name?: string;
      category?: string;
      unit?: string;
      stockQty?: number;
      unitCost?: number;
      lowStockThreshold?: number;
      isActive?: boolean;
    },
  ) {
    await this.findById(id);
    return this.prisma.rawMaterial.update({ where: { id }, data: input });
  }

  async recordPurchase(input: {
    rawMaterialId: string;
    businessId: string;
    qtyAdded: number;
    unitCost: number;
    note?: string;
  }) {
    const material = await this.findById(input.rawMaterialId);
    const previousQty = Number(material.stockQty);
    const newQty = previousQty + input.qtyAdded;
    const totalCost = input.qtyAdded * input.unitCost;

    const [, purchase] = await this.prisma.$transaction([
      this.prisma.rawMaterial.update({
        where: { id: input.rawMaterialId },
        data: {
          stockQty: newQty,
          unitCost: input.unitCost,
        },
      }),
      this.prisma.rawMaterialPurchase.create({
        data: {
          rawMaterialId: input.rawMaterialId,
          businessId: input.businessId,
          qtyAdded: input.qtyAdded,
          unitCost: input.unitCost,
          totalCost,
          note: input.note,
        },
      }),
    ]);

    return purchase;
  }
}
