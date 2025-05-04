import { Module } from '@nestjs/common'; // Hapus forwardRef jika tidak dipakai
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module'; // Impor UserModule
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UserModule, // Sediakan UserService
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Pastikan ConfigService tersedia
      useFactory: async (configService: ConfigService) => {
         const secret = configService.get<string>('JWT_SECRET');
         console.log("JWT Module Factory - Secret:", secret ? 'Loaded' : 'MISSING!'); // Debugging
         if (!secret) {
             throw new Error('JWT_SECRET environment variable is not set!');
         }
         return {
            secret: secret,
            signOptions: {
              expiresIn: configService.get<string>('JWT_EXPIRATION_TIME', '3600s'),
            },
         }
      },
      inject: [ConfigService],
    }),
    ConfigModule, // Impor jika belum global
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Sediakan AuthService dan JwtStrategy
  exports: [AuthService, JwtModule, PassportModule], // Ekspor yg mungkin dibutuhkan
})
export class AuthModule {}