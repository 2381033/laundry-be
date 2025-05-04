// src/user/user.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere } from "typeorm"; // Import FindOptionsWhere
import { User } from "./user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRole } from "./enums/user-role.enum";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(
    createUserDto: CreateUserDto,
    creatorRole: UserRole = UserRole.CUSTOMER // Default ke customer jika tidak di-pass (misal dari register)
  ): Promise<User> {
    // Ambil password (yang tipenya 'any' dari DTO)
    const { name, email, password, address, phoneNumber } = createUserDto;
    // Coba ambil role dari DTO jika ada (untuk kasus admin create)
    let role = (createUserDto as any).role; // Casting ke any untuk akses role jika ada

    // Validasi: Hanya Admin yang boleh menentukan role saat create,
    // dan hanya boleh set ke CUSTOMER atau ADMIN (tidak bisa set role yg tidak ada)
    if (role) {
      if (creatorRole !== UserRole.ADMIN) {
        this.logger.warn(
          `Non-admin user attempted to set role during user creation for email: ${email}. Defaulting to CUSTOMER.`
        );
        role = UserRole.CUSTOMER; // Abaikan role dari DTO jika creator bukan Admin
      } else if (!Object.values(UserRole).includes(role)) {
        // Jika Admin mencoba set role yang tidak valid
        this.logger.warn(
          `Invalid role "${role}" provided by admin during user creation for email: ${email}. Defaulting to CUSTOMER.`
        );
        role = UserRole.CUSTOMER;
      }
    } else {
      // Jika role tidak ada di DTO, default ke CUSTOMER
      role = UserRole.CUSTOMER;
    }

    this.logger.log(`Attempting to create user: ${email} with role: ${role}`);

    // Cek user yang sudah ada berdasarkan email
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      this.logger.warn(`Email already exists: ${email}`);
      throw new ConflictException("Email already registered");
    }

    // Validasi dan hash password
    if (password === null || password === undefined) {
      this.logger.error(`Password is null or undefined for email: ${email}`);
      throw new BadRequestException("Password cannot be empty.");
    }
    const passwordString = String(password);
    if (passwordString.trim() === "") {
      this.logger.error(
        `Password is empty after string conversion for email: ${email}`
      );
      throw new BadRequestException("Password cannot be empty.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordString, salt);
    this.logger.debug(`Password hashed for user: ${email}`);

    // Buat entitas User baru
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role, // Gunakan role yang sudah divalidasi/default
      address,
      phoneNumber,
    });

    try {
      const savedUser = await this.userRepository.save(user);
      this.logger.log(`User created successfully: ${savedUser.id} (${email})`);
      delete savedUser.password; // Hapus password dari objek yang dikembalikan
      return savedUser;
    } catch (error) {
      this.logger.error(
        `Failed to create user ${email}: ${error.message}`,
        error.stack
      );
      if (
        error.code === "23505" || // Kode error unique violation di PostgreSQL
        error.message?.includes(
          "duplicate key value violates unique constraint"
        )
      ) {
        throw new ConflictException("Email already registered");
      }
      throw new InternalServerErrorException("Could not create user.");
    }
  }

  async findAll(): Promise<User[]> {
    this.logger.log("Fetching all users");
    // Entity User sudah punya select: false untuk password, jadi aman
    return this.userRepository.find({ order: { name: "ASC" } }); // Urutkan by nama
  }

  async findOne(id: number): Promise<User> {
    // <-- Tipe ID number
    this.logger.log(`Fetching user by ID: ${id}`);
    // Validasi ID dasar
    if (isNaN(id) || id <= 0) {
      this.logger.warn(`Attempted to find user with invalid ID: ${id}`);
      throw new BadRequestException("Invalid User ID format.");
    }
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      this.logger.warn(`User not found by ID: ${id}`);
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    // Password otomatis tidak terpilih karena select: false di entity
    return user;
  }

  // Untuk AuthService (membutuhkan password)
  async findOneByEmailWithPassword(email: string): Promise<User | null> {
    this.logger.log(`Fetching user by email (with password): ${email}`);
    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password") // Paksa ambil kolom password
      .where("user.email = :email", { email })
      .getOne();

    if (!user) {
      this.logger.debug(
        `User not found by email (for login attempt): ${email}`
      );
      return null; // Kembalikan null jika tidak ditemukan
    }
    return user;
  }

  // Untuk JwtStrategy (TIDAK membutuhkan password)
  async findOneByIdForAuth(id: number): Promise<User | null> {
    // <-- Tipe ID number
    this.logger.log(`Fetching user by ID for auth validation: ${id}`);
    if (isNaN(id) || id <= 0) {
      this.logger.warn(
        `Invalid ID format received in findOneByIdForAuth: ${id}`
      );
      return null;
    }
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      this.logger.warn(`User not found by ID during auth validation: ${id}`);
      return null;
    }
    // Password otomatis tidak terpilih
    return user;
  }

  async update(
    id: number, // <-- Tipe ID number
    updateUserDto: UpdateUserDto,
    updatingUser: User // User yang melakukan request update
  ): Promise<User> {
    this.logger.log(
      `Attempting to update user ID: ${id} by user ID: ${updatingUser.id}`
    );
    // findOne sudah handle validasi format ID dan not found
    const userToUpdate = await this.findOne(id);

    const updatingUserRole = updatingUser.role;

    // Otorisasi: Hanya Admin atau user itu sendiri yang bisa update profilnya
    if (
      updatingUserRole !== UserRole.ADMIN &&
      userToUpdate.id !== updatingUser.id
    ) {
      this.logger.warn(
        `Forbidden attempt to update user ${id} by user ${updatingUser.id}`
      );
      throw new ForbiddenException(
        "You do not have permission to update this user."
      );
    }

    // Validasi perubahan role
    let roleToSet = userToUpdate.role; // Default ke role yang sudah ada
    if (updateUserDto.role && updateUserDto.role !== userToUpdate.role) {
      // Hanya Admin yang boleh mengubah role user lain
      if (updatingUserRole !== UserRole.ADMIN) {
        this.logger.warn(
          `Non-admin user ${updatingUser.id} attempted to change role for user ${id}.`
        );
        throw new ForbiddenException(
          "You do not have permission to change user roles."
        );
      }
      // Admin tidak boleh mengubah role dirinya sendiri menjadi non-admin
      // (Aturan ini bisa disesuaikan)
      if (
        userToUpdate.id === updatingUser.id &&
        updateUserDto.role !== UserRole.ADMIN
      ) {
        this.logger.warn(
          `Admin ${updatingUser.id} attempted to remove own admin role.`
        );
        throw new BadRequestException(
          "Admins cannot remove their own admin role."
        );
      }
      // Jika validasi lolos, set role baru
      roleToSet = updateUserDto.role;
    }

    // Cek konflik email jika email diubah
    if (updateUserDto.email && updateUserDto.email !== userToUpdate.email) {
      this.logger.log(
        `Checking for email conflict for new email: ${updateUserDto.email}`
      );
      // Gunakan FindOptionsWhere untuk tipe yang lebih aman
      const whereCondition: FindOptionsWhere<User> = {
        email: updateUserDto.email,
      };
      const existingUser = await this.userRepository.findOne({
        where: whereCondition,
      });
      // Jika ada user lain dengan email baru tersebut
      if (existingUser && existingUser.id !== id) {
        this.logger.warn(
          `Update failed: Email ${updateUserDto.email} already in use by user ${existingUser.id}`
        );
        throw new ConflictException("Email already in use by another account.");
      }
      userToUpdate.email = updateUserDto.email; // Update email jika tidak konflik
    }

    // Update field lain jika ada di DTO
    if (updateUserDto.name !== undefined)
      userToUpdate.name = updateUserDto.name;
    if (updateUserDto.address !== undefined)
      userToUpdate.address = updateUserDto.address;
    if (updateUserDto.phoneNumber !== undefined)
      userToUpdate.phoneNumber = updateUserDto.phoneNumber;
    userToUpdate.role = roleToSet; // Set role yang sudah divalidasi

    try {
      // Simpan perubahan ke database
      const savedUser = await this.userRepository.save(userToUpdate);
      this.logger.log(`User updated successfully: ${id}`);
      // Password tidak termuat/tersimpan, jadi aman dikembalikan
      return savedUser;
    } catch (error) {
      this.logger.error(
        `Failed to update user ${id}: ${error.message}`,
        error.stack
      );
      if (
        error.code === "23505" ||
        error.message?.includes(
          "duplicate key value violates unique constraint"
        )
      ) {
        throw new ConflictException("Email already exists.");
      }
      throw new InternalServerErrorException("Could not update user.");
    }
  }

  async remove(id: number): Promise<void> {
    // <-- Tipe ID number
    this.logger.log(`Attempting to delete user ID: ${id}`);
    // Validasi ID
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException("Invalid User ID format.");
    }
    const result = await this.userRepository.delete(id);
    // Cek apakah ada baris yang terhapus
    if (result.affected === 0) {
      this.logger.warn(`Delete failed: User not found: ${id}`);
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    this.logger.log(`User deleted successfully: ${id}`);
  }
}
