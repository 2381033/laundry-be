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
var JwtStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const user_service_1 = require("../user/user.service");
let JwtStrategy = JwtStrategy_1 = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, userService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
        this.configService = configService;
        this.userService = userService;
        this.logger = new common_1.Logger(JwtStrategy_1.name);
        this.logger.log(`JWT Secret Loaded in Strategy: ${configService.get('JWT_SECRET') ? 'Yes' : 'No - PROBLEM!'}`);
        if (!configService.get('JWT_SECRET')) {
            this.logger.error('FATAL: JWT_SECRET is not defined in environment variables!');
        }
    }
    async validate(payload) {
        this.logger.debug(`Validating JWT payload: ${JSON.stringify(payload)}`);
        if (!payload || !payload.sub) {
            this.logger.warn('Invalid JWT payload: Missing subject (sub).');
            throw new common_1.UnauthorizedException('Invalid token payload.');
        }
        const user = await this.userService.findOneByIdForAuth(payload.sub);
        if (!user) {
            this.logger.warn(`User not found for JWT subject: ${payload.sub}`);
            throw new common_1.UnauthorizedException('User not found or token invalid.');
        }
        const { password, ...result } = user;
        this.logger.debug(`JWT validation successful for user: ${user.id}`);
        return result;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = JwtStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        user_service_1.UserService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map