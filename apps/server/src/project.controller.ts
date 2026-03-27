import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ProjectType, type ApiResponse } from "@team-ape-rip/shared";
import { PrismaService } from "./prisma.service";

interface CreateProjectDto {
  organizationId: string;
  repositoryId: string;
  name: string;
  slug: string;
  type: ProjectType;
  description?: string;
}

@Controller("projects")
export class ProjectController {
  constructor(private readonly prisma: PrismaService) {}

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
    const projects = await this.prisma.project.findMany({
      where: organizationId
        ? {
            organizationId,
          }
        : undefined,
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

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
  async createProject(
    @Body() body: CreateProjectDto,
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
    const project = await this.prisma.project.create({
      data: {
        organizationId: body.organizationId,
        repositoryId: body.repositoryId,
        name: body.name,
        slug: body.slug,
        type: body.type,
        description: body.description ?? null,
      },
    });

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