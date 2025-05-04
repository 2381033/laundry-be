"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
const user_role_enum_1 = require("../user/enums/user-role.enum");
const bcrypt = require("bcrypt");
let AuthService = AuthService_1 = class AuthService {
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(registerDto) {
        const { password, confirmPassword, ...createUserRest } = registerDto;
        this.logger.log(`Registration attempt for email: ${createUserRest.email}`);
        if (String(password).trim() !== String(confirmPassword).trim()) {
            this.logger.warn(`Registration failed: Passwords do not match for ${createUserRest.email}`);
            throw new common_1.BadRequestException("Passwords do not match");
        }
        const createUserDto = {
            ...createUserRest,
            password: password,
        };
        try {
            const user = await this.userService.create(createUserDto, user_role_enum_1.UserRole.CUSTOMER);
            return user;
        }
        catch (error) {
            this.logger.error(`Registration failed for ${createUserRest.email}: ${error.message}`, error.stack);
            if (error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException("Could not complete registration.");
        }
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        this.logger.log(`Login attempt for email: ${email}`);
        const user = await this.userService.findOneByEmailWithPassword(email);
        if (!user) {
            this.logger.warn(`Login failed: User not found for email ${email}`);
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        if (!user.password) {
            this.logger.error(`Login failed: User ${email} has no password hash stored.`);
            throw new common_1.InternalServerErrorException("Authentication error.");
        }
        const isPasswordMatching = await bcrypt.compare(password, user.password);
        if (!isPasswordMatching) {
            this.logger.warn(`Login failed: Invalid password for email ${email}`);
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        this.logger.log(`Login successful for user: ${user.id} (${email})`);
        delete user.password;
        return { accessToken: accessToken, user };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map