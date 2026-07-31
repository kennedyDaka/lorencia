import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

interface CreateEventInput {
  businessId: string;
  customerId?: string;
  eventDate: Date;
  venue?: string;
  guests: number;
  quotedAmount: number;
  depositPaid?: number;
  notes?: string;
}

interface AddCostInput {
  cateringEventId: string;
  businessId: string;
  description: string;
  amount: number;
  category?: string;
}

@Injectable()
export class CateringService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(input: CreateEventInput) {
    const biz = await this.prisma.business.findUnique({
      where: { id: input.businessId },
    });
    if (!biz) throw new NotFoundException("Business not found");

    if (input.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: input.customerId },
      });
      if (!customer) throw new NotFoundException("Customer not found");
    }

    return this.prisma.cateringEvent.create({
      data: {
        businessId: input.businessId,
        customerId: input.customerId ?? null,
        eventDate: input.eventDate,
        venue: input.venue ?? null,
        guests: input.guests,
        quotedAmount: input.quotedAmount,
        depositPaid: input.depositPaid ?? 0,
        notes: input.notes ?? null,
      },
    });
  }

  async findAllByBusiness(businessId: string) {
    return this.prisma.cateringEvent.findMany({
      where: { businessId },
      include: { costs: true, customer: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const event = await this.prisma.cateringEvent.findUnique({
      where: { id },
      include: { costs: true, customer: true, business: true },
    });
    if (!event) throw new NotFoundException("Catering event not found");
    return event;
  }

  async updateStatus(id: string, status: string) {
    const event = await this.prisma.cateringEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException("Catering event not found");

    return this.prisma.cateringEvent.update({
      where: { id },
      data: {
        status,
        ...(status === "completed" ? { completedAt: new Date() } : {}),
      },
    });
  }

  async addCost(input: AddCostInput) {
    const event = await this.prisma.cateringEvent.findUnique({
      where: { id: input.cateringEventId },
    });
    if (!event) throw new NotFoundException("Catering event not found");

    const biz = await this.prisma.business.findUnique({
      where: { id: input.businessId },
    });
    if (!biz) throw new NotFoundException("Business not found");

    return this.prisma.cateringCost.create({
      data: {
        cateringEventId: input.cateringEventId,
        businessId: input.businessId,
        description: input.description,
        amount: input.amount,
        category: input.category ?? "Catering Cost",
      },
    });
  }
}
