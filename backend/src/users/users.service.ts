import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { userRoles: true },
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async getOrCreateUser(supabaseUserId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { id: supabaseUserId },
    });
    if (existing) return existing;

    return this.prisma.user.create({
      data: { id: supabaseUserId },
    });
  }

  async assignRole(input: {
    userId: string;
    businessId: string;
    role: string;
  }) {
    await this.getUserById(input.userId);

    return this.prisma.userRole.upsert({
      where: {
        userId_businessId_role: {
          userId: input.userId,
          businessId: input.businessId,
          role: input.role as any,
        },
      },
      update: {},
      create: {
        userId: input.userId,
        businessId: input.businessId,
        role: input.role as any,
      },
    });
  }

  async removeRole(userId: string, businessId: string, role: string) {
    const existing = await this.prisma.userRole.findUnique({
      where: {
        userId_businessId_role: {
          userId,
          businessId,
          role: role as any,
        },
      },
    });
    if (!existing) throw new NotFoundException("Role not found");

    return this.prisma.userRole.delete({
      where: {
        userId_businessId_role: {
          userId,
          businessId,
          role: role as any,
        },
      },
    });
  }

  async getBusinessUsers(businessId: string) {
    return this.prisma.userRole.findMany({
      where: { businessId },
      include: { user: true },
    });
  }
}
