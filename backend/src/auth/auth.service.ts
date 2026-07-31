import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface UserProfile {
  userId: string;
  email: string;
  roles: Array<{
    role: string;
    businessId: string | null;
    businessName: string | null;
    businessSlug: string | null;
  }>;
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        business: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return {
      userId,
      email: "",
      roles: userRoles.map((r) => ({
        role: r.role,
        businessId: r.businessId,
        businessName: r.business?.name ?? null,
        businessSlug: r.business?.slug ?? null,
      })),
    };
  }

  async getUserRoles(userId: string) {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: {
        business: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async hasRole(userId: string, role: string, businessId?: string) {
    const where: Record<string, unknown> = { userId, role };
    if (businessId !== undefined) {
      where.businessId = businessId;
    }
    const count = await this.prisma.userRole.count({ where });
    return count > 0;
  }
}
