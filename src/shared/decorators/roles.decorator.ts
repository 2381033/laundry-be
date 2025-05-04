// src/shared/decorators/roles.decorator.ts
import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../../user/enums/user-role.enum"; // Sesuaikan path jika perlu

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
