import {
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";
import type { ApiResponse } from "@team-ape-rip/shared";
import { AdminGuard } from "./common/admin.guard";
import { CurrentAuthUser } from "./common/current-auth-user.decorator";
import type { AuthTokenPayload } from "./common/auth-token.util";
import { PrismaService } from "./prisma.service";

@Controller("admin")
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("verify")
  getVerify(
    @CurrentAuthUser() authUser: AuthTokenPayload,
  ): ApiResponse<{
    id: string;
    username: string;
    email: string;
    role: string;
  }> {
    return {
      success: true,
      message: "Administrator session verified",
      data: {
        id: authUser.sub,
        username: authUser.username,
        email: authUser.email,
        role: authUser.role,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get("summary")
  async getSummary(): Promise<
    ApiResponse<{
      users: number;
      organizations: number;
      repositories: number;
      projects: number;
      resources: number;
      verifiedEmails: number;
      activeMembers: number;
    }>
  > {
    const [
      users,
      organizations,
      repositories,
      projects,
      resources,
      verifiedEmails,
      activeMembers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.organization.count(),
      this.prisma.repository.count(),
      this.prisma.project.count(),
      this.prisma.resource.count(),
      this.prisma.userEmail.count({
        where: {
          status: "verified",
        },
      }),
      this.prisma.organizationMember.count({
        where: {
          status: "active",
        },
      }),
    ]);

    return {
      success: true,
      message: "Dashboard summary loaded",
      data: {
        users,
        organizations,
        repositories,
        projects,
        resources,
        verifiedEmails,
        activeMembers,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get("users")
  async getUsers(): Promise<
    ApiResponse<
      Array<{
        id: string;
        username: string;
        displayName: string;
        globalRole: string;
        accountStatus: string;
        primaryEmail: string | null;
        organizationCount: number;
        createdAt: string;
        updatedAt: string;
      }>
    >
  > {
    const users = await this.prisma.user.findMany({
      include: {
        primaryEmail: true,
        memberships: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      message: "Users loaded",
      data: users.map((user) => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        globalRole: user.globalRole,
        accountStatus: user.accountStatus,
        primaryEmail: user.primaryEmail?.email ?? null,
        organizationCount: user.memberships.length,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  @Get("runtime")
  getRuntime(): ApiResponse<{
    appName: string;
    nodeEnv: string;
    uptimeSeconds: number;
    timestamp: string;
    runtime: {
      uploadDir: string;
      tempDir: string;
      cacheDir: string;
      logDir: string;
    };
  }> {
    return {
      success: true,
      message: "Runtime information loaded",
      data: {
        appName: process.env.APP_NAME ?? "Team-APE-RIP-Online-Studio",
        nodeEnv: process.env.NODE_ENV ?? "development",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        runtime: {
          uploadDir: process.env.UPLOAD_DIR ?? "/app/runtime/uploads",
          tempDir: process.env.TEMP_DIR ?? "/app/runtime/temp",
          cacheDir: process.env.CACHE_DIR ?? "/app/runtime/cache",
          logDir: process.env.LOG_DIR ?? "/app/runtime/logs/server",
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get("system")
  getSystem(): ApiResponse<{
    appName: string;
    defaultLocale: string;
    fallbackLocale: string;
    serverPort: number;
    runtime: {
      uploadDir: string;
      tempDir: string;
      cacheDir: string;
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
        serverPort: Number(process.env.SERVER_PORT ?? 3001),
        runtime: {
          uploadDir: process.env.UPLOAD_DIR ?? "/app/runtime/uploads",
          tempDir: process.env.TEMP_DIR ?? "/app/runtime/temp",
          cacheDir: process.env.CACHE_DIR ?? "/app/runtime/cache",
          logDir: process.env.LOG_DIR ?? "/app/runtime/logs/server",
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}