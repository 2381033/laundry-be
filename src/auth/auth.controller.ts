// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"; // <-- Impor Swagger
import { AuthResponseDto } from "./dto/auth-response.dto";
import { User } from "../user/user.entity"; // <-- Impor User

@ApiTags("Auth")
@Controller("auth")
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({
    status: 201,
    description: "User registered successfully.",
    type: User,
  }) // <-- Gunakan User
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 409 })
  register(@Body() registerDto: RegisterDto): Promise<User> {
    // <-- Return User
    return this.authService.register(registerDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login a user" })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 401 })
  login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }
}
