import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { User } from "../user/user.entity";
import { AuthResponseDto } from "./dto/auth-response.dto";
export declare class AuthService {
    private userService;
    private jwtService;
    private readonly logger;
    constructor(userService: UserService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<User>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
}
