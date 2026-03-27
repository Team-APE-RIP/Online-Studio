import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ResourceType, type ApiResponse } from "@team-ape-rip/shared";
import { PrismaService } from "./prisma.service";

interface CreateResourceDto {
  organizationId: string;
  repositoryId: string;
  projectId: string;
  type: ResourceType;
  title: string;
  slug: string;
  summary?: string;
  content?: unknown;
}

@Controller("resources")
export class ResourceController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getResources(
    @Query("projectId") projectId?: string,
  ): Promise<
    ApiResponse<
      Array<{
        id: string;
        organizationId: string;
        projectId: string;
        projectName: string;
        type: ResourceType;
        title: string;
        slug: string;
        summary: string | null;
        createdAt: string;
        updatedAt: string;
      }>
    >
  > {
    const resources = await this.prisma.resource.findMany({
      where: projectId
        ? {
            projectId,
          }
        : undefined,
      include: {
        project: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      message: "Resources loaded successfully",
      data: resources.map((resource) => ({
        id: resource.id,
        organizationId: resource.organizationId,
        projectId: resource.projectId,
        projectName: resource.project.name,
        type: resource.type as ResourceType,
        title: resource.title,
        slug: resource.slug,
        summary: resource.summary,
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  async createResource(
    @Body() body: CreateResourceDto,
  ): Promise<
    ApiResponse<{
      id: string;
      organizationId: string;
      projectId: string;
      type: ResourceType;
      title: string;
      slug: string;
      summary: string | null;
      createdAt: string;
      updatedAt: string;
    }>
  > {
    const resource = await this.prisma.resource.create({
      data: {
        organizationId: body.organizationId,
        repositoryId: body.repositoryId,
        projectId: body.projectId,
        type: body.type,
        title: body.title,
        slug: body.slug,
        summary: body.summary ?? null,
        content: body.content as never,
      },
    });

    return {
      success: true,
      message: "Resource created successfully",
      data: {
        id: resource.id,
        organizationId: resource.organizationId,
        projectId: resource.projectId,
        type: resource.type as ResourceType,
        title: resource.title,
        slug: resource.slug,
        summary: resource.summary,
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }
}