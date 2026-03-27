import { Controller, Get } from "@nestjs/common";
import type { ApiResponse, HealthStatus } from "@team-ape-rip/shared";

@Controller("health")
export class HealthController {
  @Get()
  getHealth(): ApiResponse<HealthStatus> {
    return {
      success: true,
      message: "Service is healthy",
      data: {
        name: process.env.APP_NAME ?? "Team-APE-RIP-Online-Studio",
        version: "0.1.0",
        status: "ok",
        time: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }
}