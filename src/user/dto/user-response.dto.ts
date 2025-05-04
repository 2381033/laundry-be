// src/user/dto/user-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "../enums/user-role.enum";
import { User } from "../user.entity"; // Impor User entity

// DTO ini mendefinisikan data User yang AMAN untuk dikirim ke klien
export class UserResponseDto {
  @ApiProperty({ example: 1, description: "Unique identifier for the user" })
  id: number; // Tipe sudah number

  @ApiProperty({ example: "John Doe", description: "User full name" })
  name: string;

  @ApiProperty({
    example: "john.doe@example.com",
    description: "User email address",
  })
  email: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.CUSTOMER,
    description: "User role",
  })
  role: UserRole;

  @ApiPropertyOptional({
    example: "123 Main St",
    description: "User address (if available)",
  })
  address?: string | null; // Pertahankan nullable jika di entity nullable

  @ApiPropertyOptional({
    example: "555-1234",
    description: "User phone number (if available)",
  })
  phoneNumber?: string | null; // Pertahankan nullable jika di entity nullable

  @ApiProperty({ description: "Date and time when the user was created" })
  createdAt: Date;

  @ApiProperty({ description: "Date and time when the user was last updated" })
  updatedAt: Date;

  // Konstruktor untuk memudahkan mapping dari User entity
  // Ini opsional jika Anda mengandalkan ClassSerializerInterceptor,
  // tapi bagus untuk kejelasan atau jika mapping manual diperlukan.
  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.address = user.address;
    this.phoneNumber = user.phoneNumber;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
