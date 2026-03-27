import { Controller, Get } from "@nestjs/common";
import type { ApiResponse } from "@team-ape-rip/shared";

@Controller()
export class AppController {
  @Get()
  getRoot(): ApiResponse<{
    name: string;
    mode: string;
    apiPrefix: string;
  }> {
    return {
      success: true,
      message: "Team-APE-RIP server is running",
      data: {
        name: process.env.APP_NAME ?? "Team-APE-RIP-Online-Studio",
        mode: process.env.NODE_ENV ?? "development",
        apiPrefix: "/api/v1",
      },
      timestamp: new Date().toISOString(),
    };
  }
}