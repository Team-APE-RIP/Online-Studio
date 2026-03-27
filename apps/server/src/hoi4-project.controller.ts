import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { ProjectType, ResourceType, type ApiResponse } from "@team-ape-rip/shared";
import { PrismaService } from "./prisma.service";

@Controller("hoi4-projects")
export class Hoi4ProjectController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("overview")
  async getOverview(): Promise<
    ApiResponse<
      Array<{
        id: string;
        organizationId: string;
        name: string;
        slug: string;
        description: string | null;
        resourceCount: number;
        focusTreeCount: number;
        localizationCount: number;
        updatedAt: string;
      }>
    >
  > {
    const projects = await this.prisma.project.findMany({
      where: {
        type: ProjectType.HOI4,
      },
      include: {
        resources: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return {
      success: true,
      message: "HOI4 project overview loaded successfully",
      data: projects.map((project) => ({
        id: project.id,
        organizationId: project.organizationId,
        name: project.name,
        slug: project.slug,
        description: project.description,
        resourceCount: project.resources.length,
        focusTreeCount: project.resources.filter(
          (resource) => resource.type === ResourceType.HOI4_FOCUS_TREE,
        ).length,
        localizationCount: project.resources.filter(
          (resource) => resource.type === ResourceType.HOI4_LOCALIZATION,
        ).length,
        updatedAt: project.updatedAt.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  @Get(":slug/focus-trees")
  async getFocusTrees(
    @Param("slug") slug: string,
  ): Promise<
    ApiResponse<
      Array<{
        id: string;
        projectId: string;
        title: string;
        slug: string;
        summary: string | null;
        updatedAt: string;
      }>
    >
  > {
    const project = await this.prisma.project.findFirst({
      where: {
        slug,
        type: ProjectType.HOI4,
      },
      include: {
        resources: {
          where: {
            type: ResourceType.HOI4_FOCUS_TREE,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`HOI4 project "${slug}" was not found`);
    }

    return {
      success: true,
      message: "HOI4 focus trees loaded successfully",
      data: project.resources.map((resource) => ({
        id: resource.id,
        projectId: resource.projectId,
        title: resource.title,
        slug: resource.slug,
        summary: resource.summary,
        updatedAt: resource.updatedAt.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  @Get(":slug/localizations")
  async getLocalizations(
    @Param("slug") slug: string,
  ): Promise<
    ApiResponse<
      Array<{
        id: string;
        projectId: string;
        title: string;
        slug: string;
        summary: string | null;
        updatedAt: string;
      }>
    >
  > {
    const project = await this.prisma.project.findFirst({
      where: {
        slug,
        type: ProjectType.HOI4,
      },
      include: {
        resources: {
          where: {
            type: ResourceType.HOI4_LOCALIZATION,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`HOI4 project "${slug}" was not found`);
    }

    return {
      success: true,
      message: "HOI4 localizations loaded successfully",
      data: project.resources.map((resource) => ({
        id: resource.id,
        projectId: resource.projectId,
        title: resource.title,
        slug: resource.slug,
        summary: resource.summary,
        updatedAt: resource.updatedAt.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  @Get(":slug")
  async getProjectDetail(
    @Param("slug") slug: string,
  ): Promise<
    ApiResponse<{
      id: string;
      organizationId: string;
      name: string;
      slug: string;
      description: string | null;
      focusTrees: Array<{
        id: string;
        title: string;
        slug: string;
        updatedAt: string;
      }>;
      localizations: Array<{
        id: string;
        title: string;
        slug: string;
        updatedAt: string;
      }>;
      resourceCount: number;
      updatedAt: string;
    }>
  > {
    const project = await this.prisma.project.findFirst({
      where: {
        slug,
        type: ProjectType.HOI4,
      },
      include: {
        resources: {
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`HOI4 project "${slug}" was not found`);
    }

    const focusTrees = project.resources.filter(
      (resource) => resource.type === ResourceType.HOI4_FOCUS_TREE,
    );
    const localizations = project.resources.filter(
      (resource) => resource.type === ResourceType.HOI4_LOCALIZATION,
    );

    return {
      success: true,
      message: "HOI4 project detail loaded successfully",
      data: {
        id: project.id,
        organizationId: project.organizationId,
        name: project.name,
        slug: project.slug,
        description: project.description,
        focusTrees: focusTrees.map((resource) => ({
          id: resource.id,
          title: resource.title,
          slug: resource.slug,
          updatedAt: resource.updatedAt.toISOString(),
        })),
        localizations: localizations.map((resource) => ({
          id: resource.id,
          title: resource.title,
          slug: resource.slug,
          updatedAt: resource.updatedAt.toISOString(),
        })),
        resourceCount: project.resources.length,
        updatedAt: project.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }
}