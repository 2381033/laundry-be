import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
   private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
     this.logger.log(`JWT Secret Loaded in Strategy: ${configService.get<string>('JWT_SECRET') ? 'Yes' : 'No - PROBLEM!'}`);
     if (!configService.get<string>('JWT_SECRET')) {
        this.logger.error('FATAL: JWT_SECRET is not defined in environment variables!');
     }
  }

  async validate(payload: any): Promise<Partial<User>> {
     this.logger.debug(`Validating JWT payload: ${JSON.stringify(payload)}`);
     if (!payload || !payload.sub) {
         this.logger.warn('Invalid JWT payload: Missing subject (sub).');
         throw new UnauthorizedException('Invalid token payload.');
     }

    const user = await this.userService.findOneByIdForAuth(payload.sub);
    if (!user) {
        this.logger.warn(`User not found for JWT subject: ${payload.sub}`);
        throw new UnauthorizedException('User not found or token invalid.');
    }

    // Kembalikan user tanpa password
    const { password, ...result } = user;
    this.logger.debug(`JWT validation successful for user: ${user.id}`);
    return result; // Menjadi request.user
  }
}