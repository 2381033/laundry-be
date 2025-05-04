import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./user.entity";
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(currentUser: User): User;
    updateProfile(currentUser: User, updateUserDto: UpdateUserDto): Promise<User>;
    deleteProfile(currentUser: User): Promise<void>;
    adminCreateUser(adminUser: User, createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User>;
    update(idToUpdate: number, adminUser: User, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: number): Promise<void>;
}
