import { Body, Controller, Post } from "@nestjs/common";
import type { ApiResponse } from "@team-ape-rip/shared";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(
    @Body() body: RegisterDto,
  ): Promise<
    ApiResponse<{
      token: string;
      user: {
        id: string;
        email: string;
        username: string;
        displayName: string;
        globalRole: string;
        createdAt: string;
      };
    }>
  > {
    const result = await this.authService.register(body);

    return {
      success: true,
      message: "User registered successfully",
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post("login")
  async login(
    @Body() body: LoginDto,
  ): Promise<
    ApiResponse<{
      token: string;
      user: {
        id: string;
        email: string;
        username: string;
        displayName: string;
        globalRole: string;
        createdAt: string;
      };
    }>
  > {
    const result = await this.authService.login(body);

    return {
      success: true,
      message: "User logged in successfully",
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}