import { Controller, Get } from "@nestjs/common";
import { ProjectType, ResourceType } from "@team-ape-rip/shared";
import type { ApiResponse } from "@team-ape-rip/shared";

@Controller("system")
export class SystemController {
  @Get("info")
  getSystemInfo(): ApiResponse<{
    appName: string;
    defaultLocale: string;
    fallbackLocale: string;
    supportedProjectTypes: string[];
    supportedResourceTypes: string[];
    runtime: {
      uploadDir: string;
      tempDir: string;
      logDir: string;
    };
  }> {
    return {
      success: true,
      message: "System information loaded",
      data: {
        appName: process.env.APP_NAME ?? "Team-APE-RIP-Online-Studio",
        defaultLocale: process.env.APP_DEFAULT_LOCALE ?? "zh-CN",
        fallbackLocale: process.env.APP_FALLBACK_LOCALE ?? "en-US",
        supportedProjectTypes: [ProjectType.GENERAL, ProjectType.HOI4],
        supportedResourceTypes: Object.values(ResourceType),
        runtime: {
          uploadDir: process.env.UPLOAD_DIR ?? "/app/runtime/uploads",
          tempDir: process.env.TEMP_DIR ?? "/app/runtime/temp",
          logDir: process.env.LOG_DIR ?? "/app/runtime/logs/server",
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}