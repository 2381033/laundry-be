// src/payment/dto/payment-query.dto.ts
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
import { PaymentStatus } from "../enums/payment-status.enum";

export class PaymentQueryDto {
  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: "Filter by User ID (Admin only)",
    example: 1,
    type: Number,
  }) // <-- UBAH Example & Tambah type
  @IsOptional()
  @Type(() => Number)
  @IsInt() // <-- UBAH
  @IsPositive() // <-- TAMBAHKAN
  userId?: number; // <-- UBAH Tipe

  @ApiPropertyOptional({
    description: "Filter by Order ID",
    example: 1,
    type: Number,
  }) // <-- UBAH Example & Tambah type
  @IsOptional()
  @Type(() => Number)
  @IsInt() // <-- UBAH
  @IsPositive() // <-- TAMBAHKAN
  orderId?: number; // <-- UBAH Tipe

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
