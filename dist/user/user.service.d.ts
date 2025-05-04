import { Repository } from "typeorm";
import { User } from "./user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRole } from "./enums/user-role.enum";
export declare class UserService {
    private userRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>);
    create(createUserDto: CreateUserDto, creatorRole?: UserRole): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User>;
    findOneByEmailWithPassword(email: string): Promise<User | null>;
    findOneByIdForAuth(id: number): Promise<User | null>;
    update(id: number, updateUserDto: UpdateUserDto, updatingUser: User): Promise<User>;
    remove(id: number): Promise<void>;
}
