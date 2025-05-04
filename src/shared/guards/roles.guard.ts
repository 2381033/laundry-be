// src/shared/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger, // Tambahkan Logger
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../../user/enums/user-role.enum"; // Sesuaikan path
import { ROLES_KEY } from "../decorators/roles.decorator"; // Sesuaikan path
import { User } from "../../user/user.entity"; // Impor User

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Dapatkan roles yang dibutuhkan dari decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // Jika tidak ada decorator @Roles(), akses diizinkan (guard ini dilewati)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Dapatkan objek user dari request (diisi oleh JwtAuthGuard -> JwtStrategy)
    const request = context.switchToHttp().getRequest();
    const user: User = request.user; // Asumsikan JwtStrategy menaruh User di request.user

    // Jika tidak ada user di request (kemungkinan JwtAuthGuard belum jalan atau gagal)
    if (!user || !user.role) {
      this.logger.warn(
        `RolesGuard denied access: User object or role not found on request. Ensure JwtAuthGuard runs first.`
      );
      // Sebaiknya lempar Unauthorized jika user tidak ada, tapi Forbidden jika user ada tapi role salah
      throw new ForbiddenException(
        "Authentication required or user data incomplete."
      );
    }

    // Cek apakah role user ada di dalam daftar requiredRoles
    const hasPermission = requiredRoles.some((role) => user.role === role);

    if (!hasPermission) {
      this.logger.warn(
        `RolesGuard denied access for user ${user.id} (${user.email}). Required: [${requiredRoles.join(", ")}], User has: "${user.role}"`
      );
      throw new ForbiddenException(
        `Access denied. You do not have the required role(s): ${requiredRoles.join(", ")}`
      );
    }

    this.logger.debug(
      `RolesGuard access granted for user ${user.id} (${user.email}). Required: [${requiredRoles.join(", ")}], User has: "${user.role}"`
    );
    return true; // Izinkan akses
  }
}
