// src/user/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  ForbiddenException, // Tambahkan ForbiddenException jika diperlukan di service
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger"; // <-- Impor Swagger
import { JwtAuthGuard } from "../shared/guards/jwt-auth.guard"; // <-- Impor Guard/Decorator
import { RolesGuard } from "../shared/guards/roles.guard"; // <-- Impor Guard/Decorator
import { Roles } from "../shared/decorators/roles.decorator"; // <-- Impor Guard/Decorator
import { GetUser } from "../shared/decorators/user.decorator"; // <-- Impor Guard/Decorator
import { UserRole } from "./enums/user-role.enum"; // <-- Impor Enum
import { User } from "./user.entity"; // <-- Impor Entity
import { UserResponseDto } from "./dto/user-response.dto"; // <-- Impor DTO Respons

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // --- Endpoint User Saat Ini ---
  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 401 })
  getProfile(@GetUser() currentUser: User): User {
    return currentUser;
  }

  @Put("me")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update current user profile" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 409 })
  updateProfile(
    @GetUser() currentUser: User,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    return this.userService.update(currentUser.id, updateUserDto, currentUser);
  }

  @Delete("me")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete current user account" })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 401 })
  async deleteProfile(@GetUser() currentUser: User): Promise<void> {
    await this.userService.remove(currentUser.id);
  }

  // --- Endpoint Admin ---
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Create a new user (Admin only)" })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 409 })
  adminCreateUser(
    @GetUser() adminUser: User,
    @Body() createUserDto: CreateUserDto
  ): Promise<User> {
    return this.userService.create(createUserDto, adminUser.role);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "List all users (Admin only)" })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Get user by ID (Admin only)" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  findOne(@Param("id", ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update user by ID (Admin only)" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 409 })
  update(
    @Param("id", ParseIntPipe) idToUpdate: number,
    @GetUser() adminUser: User,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    return this.userService.update(idToUpdate, updateUserDto, adminUser);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete user by ID (Admin only)" })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.userService.remove(id);
  }
}
