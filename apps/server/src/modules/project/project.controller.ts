import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ProjectType, type ApiResponse } from "@team-ape-rip/shared";
import { CurrentAuthUser } from "../../common/current-auth-user.decorator";
import { AuthenticatedGuard } from "../../common/authenticated.guard";
import type { AuthTokenPayload } from "../../common/auth-token.util";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectService } from "./project.service";

@Controller("projects")
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getProjects(
    @Query("organizationId") organizationId?: string,
  ): Promise<
    ApiResponse<
      Array<{
        id: string;
        organizationId: string;
        organizationName: string;
        name: string;
        slug: string;
        type: ProjectType;
        description: string | null;
        createdAt: string;
        updatedAt: string;
      }>
    >
  > {
    const projects = await this.projectService.findAll(organizationId);

    return {
      success: true,
      message: "Projects loaded successfully",
      data: projects.map((project) => ({
        id: project.id,
        organizationId: project.organizationId,
        organizationName: project.organization.name,
        name: project.name,
        slug: project.slug,
        type: project.type as ProjectType,
        description: project.description,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  async createProject(
    @Body() body: CreateProjectDto,
    @CurrentAuthUser() authUser?: AuthTokenPayload,
  ): Promise<
    ApiResponse<{
      id: string;
      organizationId: string;
      name: string;
      slug: string;
      type: ProjectType;
      description: string | null;
      createdAt: string;
      updatedAt: string;
    }>
  > {
    const project = await this.projectService.create(body, authUser?.sub);

    return {
      success: true,
      message: "Project created successfully",
      data: {
        id: project.id,
        organizationId: project.organizationId,
        name: project.name,
        slug: project.slug,
        type: project.type as ProjectType,
        description: project.description,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }
}