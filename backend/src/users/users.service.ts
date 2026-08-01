import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { createClient } from "@supabase/supabase-js";

@Injectable()
export class UsersService {
  private supabase: ReturnType<typeof createClient>;

  constructor(private readonly prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async getUserById(id: string) {
    const roles = await this.prisma.userRole.findMany({
      where: { userId: id },
      include: { business: { select: { id: true, name: true, slug: true } } },
    });

    const { data: authUser } = await this.supabase.auth.admin.getUserById(id);

    return {
      id,
      email: authUser?.user?.email ?? "",
      roles: roles.map((r) => ({
        role: r.role,
        businessId: r.businessId,
        businessName: r.business?.name ?? null,
        businessSlug: r.business?.slug ?? null,
      })),
    };
  }

  async getOrCreateUser(supabaseUserId: string) {
    const existing = await this.prisma.userRole.findFirst({
      where: { userId: supabaseUserId },
    });
    if (existing) return { id: supabaseUserId };

    return { id: supabaseUserId };
  }

  async assignRole(input: {
    userId: string;
    businessId: string;
    role: string;
  }) {
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
    });
  }
}
