import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/user.entity'; // Impor User asli

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT Access Token' })
  accessToken: string;

  @ApiProperty({ description: 'Authenticated User Details', type: () => User })
  user: User; // Kembalikan User entity (password sudah di exclude)
}