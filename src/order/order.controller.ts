// src/order/order.controller.ts
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
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { OrderQueryDto } from "./dto/order-query.dto";
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
import { OrderStatus } from "./enums/order-status.enum"; // <-- Impor Enum
import { User } from "../user/user.entity"; // <-- Impor Entity
import { Order } from "./order.entity"; // <-- Impor Entity

@ApiTags("Orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Semua endpoint order perlu login
@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // POST / (Customer/User yg login)
  @Post()
  @ApiOperation({ summary: "Place a new laundry order" })
  @ApiResponse({ status: 201, type: Order })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 404 })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: User
  ): Promise<Order> {
    return this.orderService.create(createOrderDto, user);
  }

  // GET /my (Customer/User yg login)
  @Get("my")
  @ApiOperation({ summary: "List orders placed by the current user" })
  @ApiQuery({ name: "status", required: false, enum: OrderStatus }) // Swagger doc untuk query
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({
    status: 200,
    /* type: PaginatedOrderResponseDto - jika ada */ description:
      "Array of user's orders",
  })
  @ApiResponse({ status: 401 })
  findMyOrders(
    @GetUser() user: User,
    @Query() queryDto: OrderQueryDto
  ): Promise<{ data: Order[]; total: number }> {
    // Pastikan service menangani queryDto
    return this.orderService.findUserOrders(user.id, queryDto);
  }

  // GET / (Admin only)
  @Get()
  @UseGuards(RolesGuard) // Hanya Admin setelah JwtAuthGuard
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "List all orders (Admin only)" })
  @ApiQuery({ name: "status", required: false, enum: OrderStatus })
  @ApiQuery({ name: "userId", required: false, type: Number }) // ID sekarang number
  @ApiQuery({ name: "serviceId", required: false, type: Number })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Array of all orders" })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  findAll(
    @Query() queryDto: OrderQueryDto
  ): Promise<{ data: Order[]; total: number }> {
    return this.orderService.findAll(queryDto);
  }

  // GET /:id (Customer lihat miliknya, Admin lihat semua)
  @Get(":id")
  @ApiOperation({ summary: "Get details of a specific order" })
  @ApiResponse({ status: 200, type: Order })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  findOne(
    @Param("id", ParseIntPipe) id: number,
    @GetUser() user: User
  ): Promise<Order> {
    // Service findOne HARUS cek ownership atau role Admin
    return this.orderService.findOne(id, user);
  }

  // PUT /:id (Admin only)
  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update order details (Admin only)" })
  @ApiResponse({ status: 200, type: Order })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @GetUser() adminUser: User // Untuk logging/audit jika perlu
  ): Promise<Order> {
    return this.orderService.update(id, updateOrderDto, adminUser);
  }

  // PUT /:id/cancel (Customer hanya bisa miliknya)
  @Put(":id/cancel")
  @ApiOperation({ summary: "Cancel an order (Customer, if eligible)" })
  @ApiResponse({ status: 200, type: Order })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  cancelOrder(
    @Param("id", ParseIntPipe) id: number,
    @GetUser() user: User
  ): Promise<Order> {
    // Service cancelOrder HARUS cek ownership DAN status order
    return this.orderService.cancelOrder(id, user);
  }

  // DELETE /:id (Admin only)
  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an order (Admin only - Use with caution!)" })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @GetUser() adminUser: User
  ): Promise<void> {
    // Service remove mungkin perlu adminUser untuk logging
    await this.orderService.remove(id, adminUser);
  }
}
