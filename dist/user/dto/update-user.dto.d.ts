import { UserRole } from '../enums/user-role.enum';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    role?: UserRole;
    address?: string;
    phoneNumber?: string;
}
