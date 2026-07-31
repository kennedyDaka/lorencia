import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    businessId: string;
    name: string;
    phone?: string;
    email?: string;
    notes?: string;
  }) {
    return this.prisma.customer.create({ data: input });
  }

  async findAll(businessId: string) {
    return this.prisma.customer.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException("Customer not found");
    return customer;
  }

  async update(
    id: string,
    input: { name?: string; phone?: string; email?: string; notes?: string },
  ) {
    await this.findById(id);
    return this.prisma.customer.update({ where: { id }, data: input });
  }
}
