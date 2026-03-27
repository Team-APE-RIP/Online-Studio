import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminController } from "./admin.controller";
import { AppController } from "./app.controller";
import { HealthController } from "./health.controller";
import { CollaborationGateway } from "./modules/collaboration/collaboration.gateway";
import { CollaborationService } from "./modules/collaboration/collaboration.service";
import { AuthController } from "./modules/auth/auth.controller";
import { AuthService } from "./modules/auth/auth.service";
import { Hoi4ProjectController } from "./modules/hoi4-project/hoi4-project.controller";
import { Hoi4ProjectService } from "./modules/hoi4-project/hoi4-project.service";
import { OrganizationAccessService } from "./common/organization-access.service";
import { OrganizationController } from "./modules/organization/organization.controller";
import { OrganizationService } from "./modules/organization/organization.service";
import { ProjectController } from "./modules/project/project.controller";
import { ProjectService } from "./modules/project/project.service";
import { ResourceController } from "./modules/resource/resource.controller";
import { ResourceService } from "./modules/resource/resource.service";
import { PrismaService } from "./prisma.service";
import { AdminGuard } from "./common/admin.guard";
import { SystemController } from "./system.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    AdminController,
    AppController,
    AuthController,
    HealthController,
    Hoi4ProjectController,
    OrganizationController,
    ProjectController,
    ResourceController,
    SystemController,
  ],
  providers: [
    AdminGuard,
    AuthService,
    CollaborationGateway,
    CollaborationService,
    Hoi4ProjectService,
    OrganizationAccessService,
    OrganizationService,
    ProjectService,
    ResourceService,
    PrismaService,
  ],
  exports: [PrismaService],
})
export class AppModule {}