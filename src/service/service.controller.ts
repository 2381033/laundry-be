// src/service/service.controller.ts
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
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ServiceService } from "./service.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger"; // <-- Impor Swagger
import { JwtAuthGuard } from "../shared/guards/jwt-auth.guard"; // <-- Impor Guard/Decorator
import { RolesGuard } from "../shared/guards/roles.guard"; // <-- Impor Guard/Decorator
import { Roles } from "../shared/decorators/roles.decorator"; // <-- Impor Guard/Decorator
import { UserRole } from "../user/enums/user-role.enum"; // <-- Impor Enum
import { Service } from "./service.entity"; // <-- Impor Entity

@ApiTags("Services")
@Controller("services")
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  // POST / (Admin only)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // Perlu login & role admin
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth() // Tandai butuh token
  @ApiOperation({ summary: "Create a new laundry service (Admin only)" })
  @ApiResponse({ status: 201, type: Service })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 409 })
  create(@Body() createServiceDto: CreateServiceDto): Promise<Service> {
    return this.serviceService.create(createServiceDto);
  }

  // GET / (Publik)
  @Get()
  @ApiOperation({ summary: "List all available laundry services" })
  @ApiResponse({ status: 200, type: [Service] })
  findAll(): Promise<Service[]> {
    return this.serviceService.findAll();
  }

  // GET /:id (Publik)
  @Get(":id")
  @ApiOperation({ summary: "Get details of a specific laundry service" })
  @ApiResponse({ status: 200, type: Service })
  @ApiResponse({ status: 404 })
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Service> {
    return this.serviceService.findOne(id);
  }

  // PUT /:id (Admin only)
  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a laundry service (Admin only)" })
  @ApiResponse({ status: 200, type: Service })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto
  ): Promise<Service> {
    return this.serviceService.update(id, updateServiceDto);
  }

  // DELETE /:id (Admin only)
  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a laundry service (Admin only)" })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.serviceService.remove(id);
  }
}
