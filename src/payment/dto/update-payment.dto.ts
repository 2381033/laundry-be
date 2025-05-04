import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator'; // Perbaiki impor
import { PaymentStatus } from '../enums/payment-status.enum'; // Pastikan path benar

export class UpdatePaymentDto {
  @ApiPropertyOptional({ enum: PaymentStatus, description: 'New status for the payment' })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ example: 'txn_789ghi012jkl', description: 'Updated/Added external transaction ID' })
  @IsOptional()
  @IsString()
  transactionId?: string;

   @ApiPropertyOptional({ example: 'Credit Card Online', description: 'Updated payment method details' })
   @IsOptional()
   @IsString()
   paymentMethod?: string;
}