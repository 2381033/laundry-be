// src/order/dto/create-order.dto.ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsOptional,
  IsDateString,
  IsNumber,
  IsString,
} from "class-validator"; // <-- UBAH IsUUID jadi IsInt, IsPositive

export class CreateOrderDto {
  @ApiProperty({ description: "ID of the service being ordered", example: 1 }) // <-- UBAH Example
  @IsNotEmpty()
  @IsInt() // <-- UBAH
  @IsPositive() // <-- TAMBAHKAN (opsional)
  serviceId: number; // <-- UBAH Tipe

  // --- TAMBAHKAN QUANTITY ---
  @ApiProperty({
    example: 2.5,
    type: Number,
    description: "Quantity of service (e.g., kg, pcs)",
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 }) // Sesuaikan presisi jika perlu
  @IsPositive()
  quantity: number;
  // -------------------------

  @ApiPropertyOptional({
    description: "Requested pickup date (ISO 8601)",
    example: "2024-03-15T10:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @ApiPropertyOptional({
    description: "Requested delivery date (ISO 8601)",
    example: "2024-03-17T14:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  // --- TAMBAHKAN NOTES (OPSIONAL) ---
  @ApiPropertyOptional({
    example: "Pisahkan baju putih.",
    description: "Optional notes for the order",
  })
  @IsOptional()
  @IsString() // Tambahkan IsString
  notes?: string;
  // --------------------------------
}
