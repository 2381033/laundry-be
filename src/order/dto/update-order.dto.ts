// src/order/dto/update-order.dto.ts
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsPositive,
  IsString,
} from "class-validator";
import { OrderStatus } from "../enums/order-status.enum";

export class UpdateOrderDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    description: "New status for the order",
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    example: 19.99,
    type: Number,
    description: "Corrected/Final total price (Admin only?)",
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  totalPrice?: number; // <-- TAMBAHKAN (Opsional, tergantung logika)

  @ApiPropertyOptional({
    example: 3.0,
    type: Number,
    description: "Corrected quantity",
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  quantity?: number; // <-- TAMBAHKAN (Opsional)

  @ApiPropertyOptional({
    description: "Updated pickup date (ISO 8601)",
    example: "2024-03-15T11:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @ApiPropertyOptional({
    description: "Updated delivery date (ISO 8601)",
    example: "2024-03-18T10:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @ApiPropertyOptional({
    example: "Sudah termasuk biaya antar.",
    description: "Updated notes",
  })
  @IsOptional()
  @IsString()
  notes?: string; // <-- TAMBAHKAN (Opsional)
}
