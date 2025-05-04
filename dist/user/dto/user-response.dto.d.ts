import { UserRole } from "../enums/user-role.enum";
import { User } from "../user.entity";
export declare class UserResponseDto {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    address?: string | null;
    phoneNumber?: string | null;
    createdAt: Date;
    updatedAt: Date;
    constructor(user: User);
}
