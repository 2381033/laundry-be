// src/user/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"; // IsString hanya untuk field lain
import { ApiProperty } from "@nestjs/swagger";
// Lupakan UserRole jika tidak dipakai di sini

export class CreateUserDto {
  @ApiProperty({ example: "John Doe" })
  @IsNotEmpty()
  @IsString() // Nama tetap string
  name: string;

  @ApiProperty({ example: "john.doe@example.com" })
  @IsNotEmpty()
  @IsEmail() // Email tetap divalidasi
  email: string;

  @ApiProperty({
    example: "anypassword",
    description: "User password (required, any type accepted by backend)",
  })
  @IsNotEmpty({ message: "Password should not be empty" }) // Hanya cek tidak kosong
  // --- HAPUS @IsString() DARI SINI ---
  password: any; // Ubah tipe menjadi 'any' agar class-validator tidak memaksa string

  @ApiProperty({ example: "123 Main St", required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: "555-1234", required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
