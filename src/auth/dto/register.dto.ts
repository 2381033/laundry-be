// src/auth/dto/register.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator"; // Hapus IsString
import { CreateUserDto } from "../../user/dto/create-user.dto";

export class RegisterDto extends CreateUserDto {
  // Mewarisi name, email, password(any), address, phoneNumber

  @ApiProperty({
    example: "anypassword",
    description: "Confirm password (must match password)",
  })
  @IsNotEmpty({ message: "Confirm Password should not be empty" }) // Hanya cek tidak kosong
  // --- HAPUS @IsString() DARI SINI ---
  confirmPassword: any; // Ubah tipe menjadi 'any'
}
