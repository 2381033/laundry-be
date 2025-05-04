// src/payment/dto/create-payment.dto.ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
} from "class-validator"; // <-- UBAH IsUUID jadi IsInt, IsPositive
import { PaymentStatus } from "../enums/payment-status.enum";

export class CreatePaymentDto {
  @ApiProperty({
    description: "ID of the order this payment is for",
    example: 1,
  }) // <-- UBAH Example
  @IsNotEmpty()
  @IsInt() // <-- UBAH
  @IsPositive() // <-- TAMBAHKAN
  orderId: number; // <-- UBAH Tipe

  @ApiProperty({ example: 25.5, type: Number })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({ example: "QRIS" })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus = PaymentStatus.PENDING;

  @ApiPropertyOptional({ example: "TXN_Qris12345" })
  @IsOptional()
  @IsString()
  transactionId?: string;
}
