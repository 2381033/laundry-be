import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { User } from "../user/user.entity";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<User>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
}
