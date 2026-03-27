import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { OrganizationRole } from "@prisma/client";
import { OrganizationAccessService } from "../../common/organization-access.service";
import { PrismaService } from "../../prisma.service";
import { CreateProjectDto } from "./dto/create-project.dto";

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async findAll(organizationId?: string) {
    return this.prisma.project.findMany({
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
  }

  async create(input: CreateProjectDto, userId?: string) {
    if (!userId) {
      throw new NotFoundException("Authenticated user was not found");
    }

    await this.organizationAccessService.requireRole(
      userId,
      input.organizationId,
      OrganizationRole.editor,
    );

    const repository = await this.prisma.repository.findFirst({
      where: {
        id: input.repositoryId,
        organizationId: input.organizationId,
      },
    });

    if (!repository) {
      throw new NotFoundException("Repository was not found");
    }

    const existingProject = await this.prisma.project.findUnique({
      where: {
        repositoryId_slug: {
          repositoryId: input.repositoryId,
          slug: input.slug,
        },
      },
    });

    if (existingProject) {
      throw new ConflictException("Project slug already exists in repository");
    }

    return this.prisma.project.create({
      data: {
        organizationId: input.organizationId,
        repositoryId: input.repositoryId,
        name: input.name,
        slug: input.slug,
        type: input.type,
        description: input.description ?? null,
      },
    });
  }
}