// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { User } from "../user/user.entity";
import { UserRole } from "../user/enums/user-role.enum";
import * as bcrypt from "bcrypt";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { CreateUserDto } from "../user/dto/create-user.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    // Ambil password dan confirmPassword (tipe 'any' dari DTO)
    const { password, confirmPassword, ...createUserRest } = registerDto;
    this.logger.log(`Registration attempt for email: ${createUserRest.email}`);

    // --- PERBANDINGAN LONGGAR ---
    // Konversi ke string SEBELUM membandingkan
    if (String(password).trim() !== String(confirmPassword).trim()) {
      // Tambahkan .trim() untuk mengabaikan spasi di awal/akhir
      // --- AKHIR PERBANDINGAN ---
      this.logger.warn(
        `Registration failed: Passwords do not match for ${createUserRest.email}`
      );
      throw new BadRequestException("Passwords do not match");
    }

    // Buat DTO yang sesuai untuk userService.create
    // Kirim password asli (tipe any) ke service
    const createUserDto: CreateUserDto = {
      ...createUserRest,
      password: password, // Kirim tipe 'any'
    };

    try {
      // UserService.create akan menghandle konversi ke string sebelum hashing
      const user = await this.userService.create(
        createUserDto,
        UserRole.CUSTOMER // Hanya customer yang bisa register lewat endpoint ini
      );
      // Password sudah dihapus oleh service atau interceptor
      return user;
    } catch (error) {
      this.logger.error(
        `Registration failed for ${createUserRest.email}: ${error.message}`,
        error.stack // Log stack trace untuk debugging
      );
      // Re-throw error yang sudah spesifik (Conflict, Bad Request)
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      // Error lain dianggap Internal Server Error
      throw new InternalServerErrorException(
        "Could not complete registration."
      );
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Password di LoginDto masih string (karena input form biasanya string)
    const { email, password } = loginDto;
    this.logger.log(`Login attempt for email: ${email}`);

    const user = await this.userService.findOneByEmailWithPassword(email);

    if (!user) {
      this.logger.warn(`Login failed: User not found for email ${email}`);
      throw new UnauthorizedException("Invalid credentials");
    }
    // Periksa apakah user.password (hash dari DB) ada
    if (!user.password) {
      this.logger.error(
        `Login failed: User ${email} has no password hash stored.`
      );
      // Ini seharusnya tidak terjadi jika user dibuat dengan benar
      throw new InternalServerErrorException("Authentication error.");
    }

    // bcrypt.compare bisa handle password input string vs hash string
    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      this.logger.warn(`Login failed: Invalid password for email ${email}`);
      throw new UnauthorizedException("Invalid credentials");
    }

    // Buat payload JWT
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`Login successful for user: ${user.id} (${email})`);

    // Hapus password dari objek user sebelum dikembalikan
    delete user.password;

    return { accessToken: accessToken, user }; // Pastikan nama field cocok dengan AuthResponseDto
  }
}
