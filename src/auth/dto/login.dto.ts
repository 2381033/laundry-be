import { IsEmail, IsNotEmpty, IsString } from 'class-validator'; // Hapus MinLength jika tidak perlu
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' }) // Beri contoh yg valid
  @IsNotEmpty()
  @IsString()
  password: string;
}