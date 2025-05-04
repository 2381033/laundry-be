// src/shared/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../../user/user.entity"; // Sesuaikan path jika perlu

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    // Pastikan request.user diisi oleh JwtStrategy
    return request.user;
  }
);
