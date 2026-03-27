import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { OrganizationRole } from "@prisma/client";
import { OrganizationAccessService } from "../../common/organization-access.service";
import { PrismaService } from "../../prisma.service";
import { CreateResourceDto } from "./dto/create-resource.dto";
import { UpdateResourceDto } from "./dto/update-resource.dto";

@Injectable()
export class ResourceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async findAll(projectId?: string) {
    return this.prisma.resource.findMany({
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
  }

  async create(input: CreateResourceDto, userId?: string) {
    if (!userId) {
      throw new NotFoundException("Authenticated user was not found");
    }

    await this.organizationAccessService.requireRole(
      userId,
      input.organizationId,
      OrganizationRole.editor,
    );

    const project = await this.prisma.project.findFirst({
      where: {
        id: input.projectId,
        repositoryId: input.repositoryId,
        organizationId: input.organizationId,
      },
    });

    if (!project) {
      throw new NotFoundException("Project was not found");
    }

    const existingResource = await this.prisma.resource.findUnique({
      where: {
        projectId_slug: {
          projectId: input.projectId,
          slug: input.slug,
        },
      },
    });

    if (existingResource) {
      throw new ConflictException("Resource slug already exists in project");
    }

    return this.prisma.resource.create({
      data: {
        organizationId: input.organizationId,
        repositoryId: input.repositoryId,
        projectId: input.projectId,
        type: input.type,
        title: input.title,
        slug: input.slug,
        summary: input.summary ?? null,
        content: input.content as never,
      },
    });
  }

  async update(id: string, input: UpdateResourceDto, userId?: string) {
    if (!userId) {
      throw new NotFoundException("Authenticated user was not found");
    }

    const existingResource = await this.prisma.resource.findUnique({
      where: {
        id,
      },
    });

    if (!existingResource) {
      throw new NotFoundException("Resource was not found");
    }

    await this.organizationAccessService.requireRole(
      userId,
      existingResource.organizationId,
      OrganizationRole.editor,
    );

    const currentRevision = existingResource.updatedAt.toISOString();

    if (input.baseRevision && input.baseRevision !== currentRevision) {
      throw new ConflictException("Resource revision conflict");
    }

    if (input.slug && input.slug !== existingResource.slug) {
      const duplicatedResource = await this.prisma.resource.findUnique({
        where: {
          projectId_slug: {
            projectId: existingResource.projectId,
            slug: input.slug,
          },
        },
      });

      if (duplicatedResource) {
        throw new ConflictException("Resource slug already exists in project");
      }
    }

    return this.prisma.resource.update({
      where: {
        id,
      },
      data: {
        type: input.type,
        title: input.title,
        slug: input.slug,
        summary: input.summary,
        content: input.content as never,
      },
    });
  }
}