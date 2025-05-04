import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsPositive, Min } from 'class-validator'; // Perbaiki impor

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'Premium Wash & Fold', description: 'Name of the laundry service' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Premium washing, folding, and ironing.', description: 'Detailed description of the service' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 25.50, type: Number, description: 'Price of the service' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'Price must be a positive number' })
  price?: number;

  @ApiPropertyOptional({ example: '24 hours', description: 'Estimated turnaround time' })
  @IsOptional()
  @IsString()
  estimatedDuration?: string;
}