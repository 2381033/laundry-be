import { Module } from '@nestjs/common'; // Hapus forwardRef jika tidak dipakai
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Ekspor service agar bisa dipakai AuthModule
})
export class UserModule {}