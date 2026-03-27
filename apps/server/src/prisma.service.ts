import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const allowBootWithoutDb = process.env.ALLOW_BOOT_WITHOUT_DB === "true";

    try {
      await this.$connect();
    } catch (error) {
      if (!allowBootWithoutDb) {
        throw error;
      }

      this.logger.warn(
        "Database connection failed, booting in degraded mode because ALLOW_BOOT_WITHOUT_DB=true",
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}