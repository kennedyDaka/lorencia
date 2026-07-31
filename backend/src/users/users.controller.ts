import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("business/:businessId")
  getBusinessUsers(@Param("businessId") businessId: string) {
    return this.usersService.getBusinessUsers(businessId);
  }

  @Get(":id")
  getUser(@Param("id") id: string) {
    return this.usersService.getUserById(id);
  }

  @Post("roles")
  assignRole(
    @Body() input: { userId: string; businessId: string; role: string },
  ) {
    return this.usersService.assignRole(input);
  }

  @Delete("roles")
  removeRole(
    @Query("userId") userId: string,
    @Query("businessId") businessId: string,
    @Query("role") role: string,
  ) {
    return this.usersService.removeRole(userId, businessId, role);
  }
}
