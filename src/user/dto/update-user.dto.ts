import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Johnathan Doe', description: 'User full name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'john.doe.new@example.com', description: 'User email address (unique)' })
  @IsOptional()
  @IsEmail()
  email?: string;

  // Password update sebaiknya di endpoint terpisah

  @ApiPropertyOptional({ example: UserRole.ADMIN, enum: UserRole, description: 'User role (Admin only)' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: '456 Side Ave', description: 'User address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '555-5678', description: 'User phone number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}