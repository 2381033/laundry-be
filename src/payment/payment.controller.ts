// src/payment/payment.controller.ts
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
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PaymentQueryDto } from "./dto/payment-query.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger"; // <-- Impor Swagger
import { JwtAuthGuard } from "../shared/guards/jwt-auth.guard"; // <-- Impor Guard/Decorator
import { RolesGuard } from "../shared/guards/roles.guard"; // <-- Impor Guard/Decorator
import { Roles } from "../shared/decorators/roles.decorator"; // <-- Impor Guard/Decorator
import { GetUser } from "../shared/decorators/user.decorator"; // <-- Impor Guard/Decorator
import { UserRole } from "../user/enums/user-role.enum"; // <-- Impor Enum
import { PaymentStatus } from "./enums/payment-status.enum"; // <-- Impor Enum
import { User } from "../user/user.entity"; // <-- Impor Entity
import { Payment } from "./payment.entity"; // <-- Impor Entity

@ApiTags("Payments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Semua endpoint payment perlu login
@Controller("payments")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // POST / (Admin only)
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Record a new payment (Admin only)" })
  @ApiResponse({ status: 201, type: Payment })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @GetUser() adminUser: User
  ): Promise<Payment> {
    // Service create mungkin perlu adminUser untuk validasi
    return this.paymentService.create(createPaymentDto, adminUser);
  }

  // GET /my (Customer/User yg login)
  @Get("my")
  @ApiOperation({ summary: "List payments made by the current user" })
  @ApiQuery({ name: "paymentStatus", required: false, enum: PaymentStatus })
  @ApiQuery({ name: "orderId", required: false, type: Number })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Array of user's payments" })
  @ApiResponse({ status: 401 })
  findMyPayments(
    @GetUser() user: User,
    @Query() queryDto: PaymentQueryDto
  ): Promise<{ data: Payment[]; total: number }> {
    // Service harus memfilter berdasarkan user.id
    return this.paymentService.findUserPayments(user.id, queryDto);
  }

  // GET / (Admin only)
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "List all payments (Admin only)" })
  @ApiQuery({ name: "paymentStatus", required: false, enum: PaymentStatus })
  @ApiQuery({ name: "userId", required: false, type: Number }) // ID number
  @ApiQuery({ name: "orderId", required: false, type: Number }) // ID number
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Array of all payments" })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  findAll(
    @Query() queryDto: PaymentQueryDto
  ): Promise<{ data: Payment[]; total: number }> {
    return this.paymentService.findAll(queryDto);
  }

  // GET /:id (Customer lihat miliknya, Admin lihat semua)
  @Get(":id")
  @ApiOperation({ summary: "Get details of a specific payment" })
  @ApiResponse({ status: 200, type: Payment })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  findOne(
    @Param("id", ParseIntPipe) id: number,
    @GetUser() user: User
  ): Promise<Payment> {
    // Service findOne HARUS cek ownership atau role Admin
    return this.paymentService.findOne(id, user);
  }

  // PUT /:id (Admin only)
  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update payment details (Admin only)" })
  @ApiResponse({ status: 200, type: Payment })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @GetUser() adminUser: User // Untuk logging/audit jika perlu
  ): Promise<Payment> {
    return this.paymentService.update(id, updatePaymentDto, adminUser);
  }

  // DELETE /:id (Admin only)
  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete a payment record (Admin only - Use with caution!)",
  })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @GetUser() adminUser: User
  ): Promise<void> {
    // Service remove mungkin perlu adminUser untuk logging
    await this.paymentService.remove(id, adminUser);
  }
}
