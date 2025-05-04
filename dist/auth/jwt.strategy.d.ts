import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userService;
    private readonly logger;
    constructor(configService: ConfigService, userService: UserService);
    validate(payload: any): Promise<Partial<User>>;
}
export {};
