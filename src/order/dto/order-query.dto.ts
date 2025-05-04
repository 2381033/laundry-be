// src/order/dto/order-query.dto.ts
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsPositive,
} from "class-validator"; // <-- UBAH IsUUID jadi IsInt, IsPositive
import { Type } from "class-transformer";
import { OrderStatus } from "../enums/order-status.enum";

export class OrderQueryDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: "Filter by User ID (Admin only)",
    example: 1,
    type: Number,
  }) // <-- UBAH Example & Tambah type
  @IsOptional()
  @Type(() => Number) // <-- PENTING untuk konversi query string
  @IsInt() // <-- UBAH
  @IsPositive() // <-- TAMBAHKAN
  userId?: number; // <-- UBAH Tipe

  @ApiPropertyOptional({
    description: "Filter by Service ID",
    example: 1,
    type: Number,
  }) // <-- TAMBAHKAN (Opsional)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  serviceId?: number;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
