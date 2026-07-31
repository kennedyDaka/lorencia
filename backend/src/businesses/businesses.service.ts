import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BusinessesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.business.findMany({ orderBy: { name: "asc" } });
  }

  async findBySlug(slug: string) {
    return this.prisma.business.findUnique({ where: { slug } });
  }

  async findById(id: string) {
    return this.prisma.business.findUnique({ where: { id } });
  }
}
