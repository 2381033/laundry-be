import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsPositive, Min } from 'class-validator'; // Perbaiki impor

export class CreateServiceDto {
  @ApiProperty({ example: 'Regular Wash & Fold', description: 'Name of the laundry service' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Standard washing and folding for everyday clothes.', description: 'Detailed description of the service' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 15.99, type: Number, description: 'Price of the service' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  @ApiProperty({ example: '48 hours', description: 'Estimated turnaround time' })
  @IsNotEmpty()
  @IsString()
  estimatedDuration: string;
}